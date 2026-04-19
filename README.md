# Canteen-Optimizer
Smart Canteen Optimizer is a web-based system designed to reduce long queues and inefficiencies in college canteens. It allows students to pre-order food, check real-time crowd levels, and pick up orders using QR-based digital tokens, while helping canteen staff manage orders more efficiently.# 🍽️ Smart Canteen Optimizer

Smart Canteen Optimizer is a web-based system designed to reduce long queues and inefficiencies in college canteens. It allows students to pre-order food, check real-time crowd levels, and pick up orders using QR-based digital tokens, while helping canteen staff manage orders more efficiently.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express |
| Real-time | Socket.IO |
| Database | Firebase Firestore |
| Notifications | Firebase Cloud Messaging (FCM) |
| Deployment (FE) | Vercel |
| Deployment (BE) | Render / Railway |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

Verify with:

```bash
node -v
npm -v
```

---

### 1. Clone the Repository

```bash
git clone <repo-url>
cd smart-canteen-optimizer
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

#### Frontend Dependencies

| Package | Purpose |
|---|---|
| `react` | UI library |
| `react-dom` | DOM rendering |
| `typescript` | Type safety |
| `vite` | Build tool and dev server |
| `tailwindcss` | Utility-first CSS framework |
| `@vitejs/plugin-react` | Vite plugin for React |

---

### 3. Backend Setup

```bash
cd backend
npm install
npm start
```

The server will run at `http://localhost:3000`.

#### Backend Dependencies

| Package | Purpose |
|---|---|
| `express` | HTTP server framework |
| `socket.io` | Real-time bidirectional events |
| `firebase-admin` | Firebase server-side SDK |
| `cors` | Cross-origin request handling |
| `dotenv` | Environment variable management |

---

## 📁 Project Structure

```
smart-canteen-optimizer/
├── frontend/               # React + TypeScript app
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── backend/                # Node.js + Express server
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## ✅ Features (MVP)

- Live Crowd Meter (Low / Medium / High)
- Real-time crowd updates via Socket.IO
- Time-slot based ordering
- QR-based digital token system
- Order confirmation and food-ready alerts
- Staff dashboard for order management

## 🔮 Upcoming Features

- Estimated wait time prediction
- Best time to visit suggestions
- Group ordering
- Inventory tracking
- Analytics dashboard

---

## 📊 Success Metrics

- Reduced student wait time
- Faster order processing
- Improved user satisfaction scores
- Better crowd distribution across time slots

---

## 🤝 Contributing

- NitinKumar10224
- RITAMDAS556
- anokhi7
- khushi-tk

---

## 📄 License

This project is for educational purposes.