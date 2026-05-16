/**
 * services/orderService.ts
 *
 * Typed service layer wrapping all Supabase order operations.
 * Handles conversion between DB row format and the two client-side
 * shapes: OrderToken (student) and Order (admin).
 *
 * Also exposes a real-time subscription helper so hooks can react
 * to changes made in other tabs / by other users.
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

/** Insert a new order into the database. */
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
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.from('orders').insert({
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
  });

  if (error) throw error;
}

/** Fetch all orders placed by a specific student. */
export async function fetchStudentOrders(
  studentId: string,
): Promise<OrderToken[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as OrderRow[]).map(rowToOrderToken);
}

/** Fetch every order (admin view). */
export async function fetchAllOrders(): Promise<Order[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as OrderRow[]).map(rowToAdminOrder);
}

/** Update an order's status. */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw error;
}

/**
 * Subscribe to all changes on the orders table.
 * Returns an unsubscribe function.
 */
export function subscribeToOrders(onUpdate: () => void): () => void {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('orders-realtime')
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
