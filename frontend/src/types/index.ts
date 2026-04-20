/**
 * types/index.ts
 *
 * Central type definitions for the Smart Canteen Optimizer.
 * All shared interfaces and type aliases live here — no inline
 * types are allowed in component files.
 */

/* ── Enum-like union types ─────────────────────────────────── */

/** Dietary classification shown as a colored badge on menu items. */
export type DietaryTag = 'veg' | 'non-veg' | 'vegan' | 'contains-egg';

/** Real-time crowd level used to color the gauge and background. */
export type CrowdLevel = 'low' | 'medium' | 'high';

/** Lifecycle status of a placed order. */
export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'cancelled';

/** Top-level navigation state — drives the view state-machine. */
export type AppView = 'home' | 'checkout' | 'confirmation' | 'my-orders';

/* ── Data models ───────────────────────────────────────────── */

/** A single item on the canteen menu. */
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  prepTimeMinutes: number;
  category: string;
  emoji: string;
  dietaryTag: DietaryTag;
  available: boolean;
}

/** A menu item coupled with an ordered quantity. */
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

/** Snapshot of the canteen's current crowd / queue state. */
export interface CrowdStatus {
  level: CrowdLevel;
  estimatedWaitMinutes: number;
  preparingOrderCount: number;
  staffOnDuty: number;
  lastUpdatedAt: string;
  manualOverride: boolean;
}

/** An available pickup time-slot window. */
export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
  spotsRemaining: number;
}

/** Confirmation token returned after a successful order. */
export interface OrderToken {
  orderId: string;
  tokenCode: string;
  qrPayload: string;
  status: OrderStatus;
  pickupSlot: TimeSlot;
  items: CartItem[];
  totalAmount: number;
  placedAt: string;
  estimatedReadyAt: string;
}

/** Generic wrapper for async data, loading, and error state. */
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/* ── API-specific types ────────────────────────────────────── */

/** Standard API envelope used by all service functions. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Payload sent to `placeOrder()`. */
export interface OrderRequest {
  items: { menuItemId: string; quantity: number }[];
  totalAmount: number;
  slotId: string;
  userId: string;
}
