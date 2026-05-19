/**
 * services/orderService.ts
 *
 * Typed service layer wrapping all Supabase order operations.
 * Falls back to localStorage when Supabase is offline so the
 * dummy student ↔ admin sync works in mock/demo mode.
 */

import { supabase } from './supabaseClient';
import type {
  CartItem,
  Order,
  OrderStatus,
  OrderToken,
  TimeSlot,
} from '../types';

/* ── DB Row shape ─────────────────────────────────────────── */

interface OrderRow {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  items: Array<{
    menuItem: CartItem['menuItem'];
    quantity: number;
    subtotal: number;
  }>;
  total: number;
  status: string;
  time_slot: string;
  pickup_time: string;
  pickup_slot: TimeSlot;
  token_code: string;
  qr_payload: string;
  estimated_ready_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Mock persistence helpers ─────────────────────────────── */

const MOCK_ORDERS_KEY = 'canteen_orders_mock';
const MOCK_ORDERS_EVENT = 'canteen-orders-change';

function loadMockRows(): OrderRow[] {
  const raw = localStorage.getItem(MOCK_ORDERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OrderRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMockRows(rows: OrderRow[]): void {
  localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(rows));
  window.dispatchEvent(new StorageEvent('storage', { key: MOCK_ORDERS_KEY }));
  window.dispatchEvent(new CustomEvent(MOCK_ORDERS_EVENT));
}

/* ── Row → Client Converters ──────────────────────────────── */

function rowToOrderToken(row: OrderRow): OrderToken {
  return {
    orderId: row.id,
    tokenCode: row.token_code,
    qrPayload: row.qr_payload,
    status: row.status as OrderStatus,
    pickupSlot: row.pickup_slot,
    items: row.items.map((i) => ({
      menuItem: i.menuItem,
      quantity: i.quantity,
    })),
    totalAmount: Number(row.total),
    placedAt: row.created_at,
    estimatedReadyAt: row.estimated_ready_at ?? row.created_at,
  };
}

function rowToAdminOrder(row: OrderRow): Order {
  return {
    id: row.id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    items: row.items.map((i) => ({
      menuItem: i.menuItem,
      quantity: i.quantity,
      subtotal: i.subtotal,
    })),
    total: Number(row.total),
    status: row.status as OrderStatus,
    timeSlot: row.time_slot,
    pickupTime: row.pickup_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes ?? undefined,
  };
}

/* ── Public API ───────────────────────────────────────────── */

/** Insert a new order into the database (or localStorage in mock mode). */
export async function createOrder(data: {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timeSlot: string;
  pickupTime: string;
  pickupSlot: TimeSlot;
  tokenCode: string;
  qrPayload: string;
  estimatedReadyAt: string;
}): Promise<void> {
  const row: OrderRow = {
    id: data.id,
    student_id: data.studentId,
    student_name: data.studentName,
    student_email: data.studentEmail,
    items: data.items.map((ci) => ({
      menuItem: ci.menuItem,
      quantity: ci.quantity,
      subtotal: ci.menuItem.price * ci.quantity,
    })),
    total: data.total,
    status: data.status,
    time_slot: data.timeSlot,
    pickup_time: data.pickupTime,
    pickup_slot: data.pickupSlot,
    token_code: data.tokenCode,
    qr_payload: data.qrPayload,
    estimated_ready_at: data.estimatedReadyAt,
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (supabase) {
    const { error } = await supabase.from('orders').insert(row);
    if (error) throw error;
  } else {
    const rows = loadMockRows();
    rows.unshift(row);
    saveMockRows(rows);
  }
}

/** Fetch all orders placed by a specific student. */
export async function fetchStudentOrders(
  studentId: string,
): Promise<OrderToken[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as OrderRow[]).map(rowToOrderToken);
  }

  const rows = loadMockRows().filter((r) => r.student_id === studentId);
  return rows.map(rowToOrderToken);
}

/** Fetch every order (admin view). */
export async function fetchAllOrders(): Promise<Order[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as OrderRow[]).map(rowToAdminOrder);
  }

  return loadMockRows().map(rowToAdminOrder);
}

/** Update an order's status. */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;
    return;
  }

  const rows = loadMockRows();
  const idx = rows.findIndex((r) => r.id === orderId);
  if (idx !== -1) {
    rows[idx].status = newStatus;
    rows[idx].updated_at = new Date().toISOString();
    saveMockRows(rows);
  }
}

/**
 * Subscribe to all changes on the orders table.
 * Returns an unsubscribe function.
 *
 * Works with Supabase Realtime OR localStorage mock bridge.
 */
export function subscribeToOrders(onUpdate: () => void): () => void {
  if (supabase) {
    const channelName = `orders-rt-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          onUpdate();
        },
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }

  // Mock mode: listen to both cross-tab (storage) and same-tab (custom) events
  const onStorage = (e: StorageEvent) => {
    if (e.key === MOCK_ORDERS_KEY) onUpdate();
  };
  const onCustom = () => onUpdate();

  window.addEventListener('storage', onStorage);
  window.addEventListener(MOCK_ORDERS_EVENT, onCustom);

  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(MOCK_ORDERS_EVENT, onCustom);
  };
}