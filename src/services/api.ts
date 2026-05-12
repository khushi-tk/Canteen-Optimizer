/**
 * services/api.ts
 *
 * Service layer that abstracts all network calls behind typed async
 * functions.  When VITE_MOCK_API is "true" (or unset) every function
 * returns realistic mock data after an artificial 400-800 ms delay.
 * Flip the flag to "false" to hit real REST endpoints at
 * VITE_API_BASE_URL with JWT auth from localStorage.
 */

import type {
  ApiResponse,
  CartItem,
  CrowdStatus,
  MenuItem,
  OrderRequest,
  OrderToken,
  TimeSlot,
} from '../types';

/* ── Helpers ───────────────────────────────────────────────── */

const MOCK_MODE = import.meta.env.VITE_MOCK_API !== 'false';
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** Random delay between 400 and 800 ms. */
const mockDelay = (): Promise<void> =>
  new Promise((r) => setTimeout(r, 400 + Math.random() * 400));

/** Authenticated fetch helper (used when MOCK_MODE is off). */
async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('jwt');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as Record<string, string>).message ?? `API error ${res.status}`);
  }
  return res.json() as Promise<ApiResponse<T>>;
}

/* ── Mock data ─────────────────────────────────────────────── */

const MOCK_MENU: MenuItem[] = [
  {
    id: 'si-01',
    name: 'Masala Dosa',
    description: 'Crispy rice-lentil crêpe stuffed with spiced potato, served with sambar & chutney.',
    price: 60,
    prepTimeMinutes: 8,
    category: 'South Indian',
    emoji: '🥞',
    dietaryTag: 'veg',
    available: true,
  },
  {
    id: 'si-02',
    name: 'Idli Sambar',
    description: 'Fluffy steamed rice cakes with piping-hot lentil sambar & coconut chutney.',
    price: 40,
    prepTimeMinutes: 5,
    category: 'South Indian',
    emoji: '🍚',
    dietaryTag: 'veg',
    available: true,
  },
  {
    id: 'ri-01',
    name: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with tender chicken, raita on the side.',
    price: 120,
    prepTimeMinutes: 15,
    category: 'Rice',
    emoji: '🍗',
    dietaryTag: 'non-veg',
    available: true,
  },
  {
    id: 'ro-01',
    name: 'Paneer Kathi Roll',
    description: 'Grilled paneer, onions & peppers wrapped in a flaky paratha.',
    price: 80,
    prepTimeMinutes: 10,
    category: 'Rolls',
    emoji: '🌯',
    dietaryTag: 'veg',
    available: true,
  },
  {
    id: 'cu-01',
    name: 'Egg Curry & Rice',
    description: 'Boiled eggs in a rich tomato-onion gravy, served with steamed rice.',
    price: 75,
    prepTimeMinutes: 12,
    category: 'Curry',
    emoji: '🍛',
    dietaryTag: 'contains-egg',
    available: true,
  },
  {
    id: 'bv-01',
    name: 'Cold Coffee',
    description: 'Chilled coffee blended with milk & ice — the campus favourite.',
    price: 45,
    prepTimeMinutes: 3,
    category: 'Beverages',
    emoji: '☕',
    dietaryTag: 'veg',
    available: true,
  },
  {
    id: 'sn-01',
    name: 'Samosa (2 pcs)',
    description: 'Crispy golden pastry pockets filled with spiced potato & peas.',
    price: 25,
    prepTimeMinutes: 4,
    category: 'Snacks',
    emoji: '🔺',
    dietaryTag: 'veg',
    available: true,
  },
  {
    id: 'ni-01',
    name: 'Chole Bhature',
    description: 'Fluffy deep-fried bread paired with spicy chickpea curry.',
    price: 70,
    prepTimeMinutes: 10,
    category: 'North Indian',
    emoji: '🫓',
    dietaryTag: 'veg',
    available: false, // unavailable item
  },
  {
    id: 'bu-01',
    name: 'Chicken Burger',
    description: 'Juicy grilled chicken patty with lettuce, cheese & mayo in a toasted bun.',
    price: 90,
    prepTimeMinutes: 8,
    category: 'Burgers',
    emoji: '🍔',
    dietaryTag: 'non-veg',
    available: true,
  },
  {
    id: 'bv-02',
    name: 'Mango Lassi',
    description: 'Thick yogurt smoothie blended with Alphonso mango pulp.',
    price: 50,
    prepTimeMinutes: 3,
    category: 'Beverages',
    emoji: '🥭',
    dietaryTag: 'veg',
    available: true,
  },
];

const MOCK_CROWD: CrowdStatus = {
  level: 'medium',
  estimatedWaitMinutes: 14,
  preparingOrderCount: 6,
  staffOnDuty: 3,
  lastUpdatedAt: new Date().toISOString(),
  manualOverride: false,
};

/** Generate 10 time-slots starting ~15 min from now. */
function generateTimeSlots(): TimeSlot[] {
  const now = new Date();
  const baseMinutes = now.getHours() * 60 + now.getMinutes() + 15;
  const rounded = Math.ceil(baseMinutes / 15) * 15;

  return Array.from({ length: 10 }, (_, i) => {
    const startMinTotal = rounded + i * 15;
    const endMinTotal = startMinTotal + 10;
    const startH = Math.floor(startMinTotal / 60) % 24;
    const startM = startMinTotal % 60;
    const endH = Math.floor(endMinTotal / 60) % 24;
    const endM = endMinTotal % 60;

    const fmt = (h: number, m: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    };
    const pad2 = (n: number) => String(n).padStart(2, '0');

    // Make at least one slot full (index 2)
    const spots = i === 2 ? 0 : Math.floor(Math.random() * 9);

    return {
      id: `slot-${i}`,
      label: `${fmt(startH, startM)} – ${fmt(endH, endM)}`,
      startTime: `${pad2(startH)}:${pad2(startM)}`,
      endTime: `${pad2(endH)}:${pad2(endM)}`,
      available: spots > 0,
      spotsRemaining: spots,
    };
  });
}

/** Deterministic random-looking 4-char code. */
function generateTokenCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `HIT-${code}`;
}

/* ── Public API ────────────────────────────────────────────── */

export async function fetchCrowdStatus(): Promise<ApiResponse<CrowdStatus>> {
  if (MOCK_MODE) {
    await mockDelay();
    return {
      success: true,
      data: { ...MOCK_CROWD, lastUpdatedAt: new Date().toISOString() },
    };
  }
  return apiFetch<CrowdStatus>('/crowd');
}

export async function fetchMenu(): Promise<ApiResponse<MenuItem[]>> {
  if (MOCK_MODE) {
    await mockDelay();
    return { success: true, data: MOCK_MENU };
  }
  return apiFetch<MenuItem[]>('/menu');
}

export async function fetchTimeSlots(): Promise<ApiResponse<TimeSlot[]>> {
  if (MOCK_MODE) {
    await mockDelay();
    return { success: true, data: generateTimeSlots() };
  }
  return apiFetch<TimeSlot[]>('/slots');
}

export async function placeOrder(req: OrderRequest): Promise<ApiResponse<OrderToken>> {
  if (MOCK_MODE) {
    await mockDelay();
    const slots = generateTimeSlots();
    const slot = slots.find((s) => s.id === req.slotId) ?? slots[0];
    const tokenCode = generateTokenCode();
    const now = new Date();
    const readyAt = new Date(now.getTime() + 18 * 60_000);

    // Rebuild CartItem[] from the menu
    const items: CartItem[] = req.items.map((ri) => ({
      menuItem: MOCK_MENU.find((m) => m.id === ri.menuItemId) ?? MOCK_MENU[0],
      quantity: ri.quantity,
    }));

    const token: OrderToken = {
      orderId: `ord-${Date.now()}`,
      tokenCode,
      qrPayload: JSON.stringify({ orderId: `ord-${Date.now()}`, tokenCode }),
      status: 'confirmed',
      pickupSlot: slot,
      items,
      totalAmount: req.totalAmount,
      placedAt: now.toISOString(),
      estimatedReadyAt: readyAt.toISOString(),
    };
    return { success: true, data: token };
  }
  return apiFetch<OrderToken>('/orders', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function fetchMyOrders(): Promise<ApiResponse<OrderToken[]>> {
  if (MOCK_MODE) {
    await mockDelay();
    // Return a couple of past mock orders for demo purposes
    const slots = generateTimeSlots();
    const pastOrders: OrderToken[] = [
      {
        orderId: 'ord-prev-1',
        tokenCode: 'HIT-9B3F',
        qrPayload: JSON.stringify({ orderId: 'ord-prev-1', tokenCode: 'HIT-9B3F' }),
        status: 'preparing',
        pickupSlot: slots[1],
        items: [
          { menuItem: MOCK_MENU[0], quantity: 1 },
          { menuItem: MOCK_MENU[5], quantity: 2 },
        ],
        totalAmount: 150,
        placedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
        estimatedReadyAt: new Date(Date.now() + 8 * 60_000).toISOString(),
      },
      {
        orderId: 'ord-prev-2',
        tokenCode: 'HIT-4XPK',
        qrPayload: JSON.stringify({ orderId: 'ord-prev-2', tokenCode: 'HIT-4XPK' }),
        status: 'picked_up',
        pickupSlot: slots[3],
        items: [{ menuItem: MOCK_MENU[2], quantity: 1 }],
        totalAmount: 120,
        placedAt: new Date(Date.now() - 60 * 60_000).toISOString(),
        estimatedReadyAt: new Date(Date.now() - 40 * 60_000).toISOString(),
      },
    ];
    return { success: true, data: pastOrders };
  }
  return apiFetch<OrderToken[]>('/orders');
}
