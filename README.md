# 🍽️ HIT Smart Canteen Optimizer

A mobile-first web application for **Heritage Institute of Technology** that helps students check canteen crowd levels, order food, and skip the queue — all from their phones.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white)

---

## ✨ Features

### 1. 📊 Live Crowd Meter
- Animated SVG half-circle gauge showing real-time canteen crowd level
- Dynamic color-coding: **Emerald** (low) → **Amber** (medium) → **Red** (high)
- Auto-polls every 30 seconds (silent background updates)
- Stats row: Preparing Orders | Staff on Duty | Last Updated
- Manager Override badge support

### 2. 🛒 Menu & Ordering
- **2-column responsive grid** of menu items with emoji icons
- Horizontally scrollable **category filter pills** (All, South Indian, Rice, Rolls, etc.)
- **Dietary badges**: Veg (green), Non-Veg (red), Vegan (green), Egg (amber)
- **Stepper controls** with smooth Add / +/− interactions
- Unavailable items shown with 50% opacity overlay
- **Bottom-sheet Cart Drawer** with expand/collapse animation

### 3. 📅 Checkout & Time Slots
- Order summary card with item breakdown and total
- **Time Slot Picker** with color-coded availability
  - ≥5 spots → Emerald | 2-4 spots → Amber | 1 spot → Red | Full → Disabled
- Auto-selects first available slot
- Confirmation pill shows selected pickup window
- Loading state with spinner in the CTA button

### 4. 🎫 QR Token Display
- Animated 🎉 celebration header
- **Monospace token code** (e.g. `HIT-7X4K`) on dark banner
- **QR Code** generated via qrserver.com API (with offline fallback)
- **Live countdown timer** updating every second
- **4-step status tracker**: ✅ Confirmed → 👨‍🍳 Preparing → 🔔 Ready → 🎉 Picked Up
- Collapsible order summary accordion

### 5. 📦 My Orders
- Filter tabs: **All** | **Active** (with count badge) | **Done**
- Active orders: orange border ring + pulsing "Live order" banner
- Auto-refreshes every 15 seconds for active orders
- Color-coded status badges per order lifecycle
- **Show QR** button for active orders

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (LTS recommended)
- npm v9+

### Installation

```bash
# Clone or copy this project folder
cd hit-canteen

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173/**

### Environment Variables

Copy `.env.example` to `.env` (already done by default):

```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_MOCK_API=true
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:4000/api` | Base URL for the REST API |
| `VITE_MOCK_API` | `true` | Set to `false` to use real API endpoints with JWT auth |

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
hit-canteen/
├── index.html                 # Entry HTML with viewport-fit, theme-color, emoji favicon
├── package.json               # Dependencies & scripts
├── vite.config.ts             # Vite config with /api proxy
├── tsconfig.json              # Strict TypeScript config
├── tailwind.config.ts         # Custom colors, keyframes, animations
├── postcss.config.js          # Tailwind + Autoprefixer
├── .env                       # Environment variables
├── .env.example               # Env template
│
└── src/
    ├── main.tsx               # Entry: StrictMode → ErrorBoundary → ToastProvider → App
    ├── App.tsx                # View state machine & hook orchestration
    ├── index.css              # Tailwind directives, safe-area padding, utilities
    ├── vite-env.d.ts          # Vite client types
    │
    ├── types/
    │   └── index.ts           # All TypeScript interfaces & type aliases
    │
    ├── services/
    │   └── api.ts             # Mock/real API layer with 10 menu items
    │
    ├── hooks/
    │   ├── useCrowdStatus.ts  # 30s polling crowd data
    │   ├── useMenu.ts         # Menu fetch + full cart state management
    │   ├── useOrder.ts        # Time slots + order placement
    │   └── useToast.ts        # Context-based toast notifications
    │
    └── components/
        ├── ui/
        │   └── index.tsx      # Shared atoms: Spinner, ErrorBanner, DietaryBadge,
        │                      #   CategoryPill, Skeleton, EmptyState, SectionHeader
        ├── CrowdMeter/
        │   └── CrowdMeter.tsx # SVG gauge + stats row
        ├── Menu/
        │   ├── MenuGrid.tsx   # 2-col grid + category pills + item cards
        │   └── CartDrawer.tsx # Bottom-sheet cart with expand/collapse
        ├── Checkout/
        │   ├── TimeSlotPicker.tsx  # Color-coded slot grid
        │   └── CheckoutSummary.tsx # Full checkout view
        ├── OrderToken/
        │   └── OrderTokenScreen.tsx  # QR code + countdown + status tracker
        ├── MyOrders/
        │   └── MyOrdersView.tsx      # Orders list + filter tabs
        ├── HomeView.tsx       # Home screen composition
        ├── BottomNav.tsx      # Fixed bottom tab bar
        └── ErrorBoundary.tsx  # Class-based error boundary
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| **Primary (CTA)** | `#F97316` (Orange 500) |
| **Text** | `#1E293B` (Slate 800) |
| **Page Background** | `#F8FAFC` (Slate 50) |
| **Card Surfaces** | `#FFFFFF` (White) |
| **Card Radius** | `16px` |
| **Panel Radius** | `20px` |
| **Pill Radius** | `999px` |
| **Card Shadow** | `0 1px 3px rgba(0,0,0,0.06)` |
| **CTA Shadow** | `0 8px 24px rgba(249,115,22,0.35)` |
| **Transitions** | `150-200ms ease` |
| **Press Feedback** | `active:scale-95` / `active:scale-98` |

### Status Colors
- 🟢 **Low / Success**: Emerald (`#059669`)
- 🟡 **Medium / Warning**: Amber (`#F59E0B`)
- 🔴 **High / Danger**: Red (`#EF4444`)

---

## 🏗️ Architecture Decisions

- **No React Router** — Simple view state machine (`AppView` union type) managed in `App.tsx`
- **No Context for cart** — Cart state lives entirely in `useMenu` hook, no prop drilling beyond 2 levels
- **Context for toasts** — `ToastProvider` wraps the app, accessed via `useToast()` hook
- **Only 1 class component** — `ErrorBoundary` (React requirement); everything else is functional
- **Mock-first development** — All API functions support `MOCK_MODE` with realistic delays (400-800ms)
- **Typed throughout** — Zero `any` types, all interfaces in `types/index.ts`

---

## 🧪 Mock Data

The app ships with realistic mock data when `VITE_MOCK_API=true`:

**Menu (10 items):**

| Item | Category | Price | Diet | Available |
|------|----------|-------|------|-----------|
| 🥞 Masala Dosa | South Indian | ₹60 | Veg | ✅ |
| 🍚 Idli Sambar | South Indian | ₹40 | Veg | ✅ |
| 🍗 Chicken Biryani | Rice | ₹120 | Non-Veg | ✅ |
| 🌯 Paneer Kathi Roll | Rolls | ₹80 | Veg | ✅ |
| 🍛 Egg Curry & Rice | Curry | ₹75 | Egg | ✅ |
| ☕ Cold Coffee | Beverages | ₹45 | Veg | ✅ |
| 🔺 Samosa (2 pcs) | Snacks | ₹25 | Veg | ✅ |
| 🫓 Chole Bhature | North Indian | ₹70 | Veg | ❌ |
| 🍔 Chicken Burger | Burgers | ₹90 | Non-Veg | ✅ |
| 🥭 Mango Lassi | Beverages | ₹50 | Veg | ✅ |

**Crowd Status:** Medium level, 14 min wait, 6 orders preparing, 3 staff

**Time Slots:** 10 slots generated dynamically (15-min intervals starting 15 min from now)

---

## 📱 Mobile-First Design

- Max-width `390px` centered with shadow on desktop (simulated phone frame)
- Touch targets minimum `44×44px`
- Safe area padding for notched devices (`env(safe-area-inset-*)`)
- No visible scrollbars on horizontal scroll strips
- Bottom navigation with `env(safe-area-inset-bottom)` padding

---

## 🔌 Switching to Real API

1. Set `VITE_MOCK_API=false` in `.env`
2. Set `VITE_API_BASE_URL` to your backend URL
3. Store a JWT token in `localStorage` under the key `jwt`
4. The app will call these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/crowd` | Current crowd status |
| `GET` | `/api/menu` | Menu items |
| `GET` | `/api/slots` | Available time slots |
| `POST` | `/api/orders` | Place a new order |
| `GET` | `/api/orders` | User's order history |

All responses must follow the `ApiResponse<T>` envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

---

## 📄 License

This project was built for Heritage Institute of Technology's campus canteen system.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
