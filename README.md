# 🍽️ Hot & Spicy — AI-Powered Restaurant Management System

> A full-stack, production-ready restaurant platform featuring an **Urdu AI Voice Ordering Assistant**, real-time admin panel, customer portal, and complete order lifecycle management — built as a Final Year Project.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Admin Panel](#-admin-panel)
- [Voice Ordering (VAPI + n8n)](#-voice-ordering-vapi--n8n)
- [Email Notifications](#-email-notifications)
- [Scripts](#-scripts)
- [Default Credentials](#-default-credentials)
- [Validation Rules](#-validation-rules)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🧠 Overview

**Hot & Spicy** is an end-to-end restaurant management system that combines a modern customer-facing website with a powerful admin panel and an AI-driven voice ordering channel. Customers can browse the menu, place orders, track delivery, leave reviews, and manage their profile. Admins get a real-time dashboard with live analytics, customer insights, order management, and menu control — all backed by real MongoDB data.

The standout feature is the **Urdu AI Voice Assistant** powered by VAPI and n8n, which allows customers to place orders through a natural voice conversation. Voice orders flow into the same MongoDB collection as website orders, giving admins a unified view of all order sources.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| 🖥️ Frontend | [https://fyp-ai-restaurant-management-system.onrender.com](https://fyp-ai-restaurant-management-system.onrender.com) |
| ⚙️ Backend API | [https://fyp-ai-restaurant-management-system.onrender.com/api/v1](https://fyp-ai-restaurant-management-system.onrender.com/api/v1) |
| 💓 Health Check | [/api/v1/health](https://fyp-ai-restaurant-management-system.onrender.com/api/v1/health) |

---

## ✨ Key Features

### 👤 Customer Portal
- 🏠 Browse featured dishes, categories, and the full menu
- 🛒 Add items to cart and place orders with shipping details
- 📦 Track order status in real time (Pending → Preparing → Ready → Delivered)
- 📜 View full order history with itemised breakdowns
- ❤️ Save and manage favourite dishes
- ⭐ Submit, edit, and delete real MongoDB reviews with a required 1–5 star rating
- 📝 Preserve review drafts and menu context when guests are redirected to login
- 🧾 Display homepage and menu-item reviews from live API data with clean empty states
- 🛍️ Support guest and authenticated checkout with a required confirmation email
- 👤 Manage profile — name, phone, address, and Cloudinary avatar
- 🔐 JWT-based authentication with secure cookie handling
- 📱 Gmail-only registration and login with strict email validation
- 🔒 Password reset flow via 6-digit email code (15-minute expiry)

### 🛠️ Admin Panel
- 📊 **Real-time Analytics Dashboard** — revenue, orders, top dishes, category performance, website vs voice breakdown, last 7 days sales
- 📋 **Order Management** — view all orders, update status, filter by source (Website / Voice)
- 👥 **Customer Insights** — real customer list with order counts, total spending, active/inactive status, top spender
- 🍽️ **Menu Management** — create, edit, delete menu items with Cloudinary image uploads, toggle availability and featured status
- ⭐ **Reviews Management** — view all customer reviews with sentiment analysis, ratings, and dish tags
- 🤖 **AI Orders View** — dedicated view for voice-originated orders
- 🔔 **Live Notifications** — Orders badge shows real pending order count from MongoDB

### 🎙️ AI Voice Ordering
- Urdu-language voice assistant powered by **VAPI**
- Automated order processing workflow via **n8n**
- Voice orders saved to the same MongoDB `Order` collection as website orders
- Secure machine-to-machine API key authentication
- Order confirmation emails sent only after successful order creation when an email is available
- Voice orders linked to authenticated customers where possible

### 📧 Email Notifications
- Welcome email on registration via **EmailJS**
- Order confirmation email with full order details on every order (website and voice)
- Non-blocking — registration and order creation succeed even if email delivery fails

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│                                                             │
│   Customer Website (React + Vite)                           │
│   Admin Panel (React + Framer Motion)                       │
│   Voice Assistant (VAPI — Urdu AI)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │  HTTP / REST API
┌──────────────────────▼──────────────────────────────────────┐
│                      API LAYER                              │
│                                                             │
│   Express.js REST API  (/api/v1/*)                          │
│   JWT Auth Middleware                                       │
│   API Key Middleware (Voice Orders)                         │
│   Input Validation (express-validator)                      │
│   Helmet + CORS Security                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    SERVICE LAYER                            │
│                                                             │
│   Auth Service       │  Order Service                       │
│   Menu Service       │  Analytics Service                   │
│   Review Service     │  Admin Customers Service             │
│   Profile Service    │  Admin Reviews Service               │
│   Favorites Service  │  Email Service (EmailJS)             │
│   TTS Service (OpenAI)                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     DATA LAYER                              │
│                                                             │
│   MongoDB Atlas (Mongoose ODM)                              │
│   Collections: Users, Orders, MenuItems, Reviews,          │
│                Favorites                                    │
│   Cloudinary (Image Storage)                                │
└─────────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  AUTOMATION LAYER                           │
│                                                             │
│   n8n Workflow — Voice order processing                     │
│   n8n Webhook — Order status change notifications           │
│   VAPI — Urdu AI voice call handling                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 5 | Build tool & dev server |
| React Router DOM v6 | Client-side routing |
| Framer Motion | Animations & transitions |
| Axios | HTTP client |
| React Icons | Icon library |
| CSS Modules | Scoped component styling |

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18+ | Runtime |
| Express.js 4 | Web framework |
| MongoDB + Mongoose 8 | Database & ODM |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| Cloudinary + Multer | Image upload & storage |
| express-validator | Input validation |
| EmailJS (Node SDK) | Transactional emails |
| OpenAI SDK | Text-to-speech (TTS) |
| Winston + Morgan | Logging |
| Helmet + CORS | Security headers |
| dotenv | Environment config |

### Infrastructure & Integrations
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Cloudinary | Image CDN |
| VAPI | AI voice call platform |
| n8n | Workflow automation |
| EmailJS | Email delivery |
| Render | Hosting (backend + frontend) |

---

## 📁 Project Structure

```
restaurant-ai-system/
│
├── 📂 backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── cloudinaryConfig.js     # Cloudinary SDK setup
│   │   │   ├── corsConfig.js           # CORS allowed origins
│   │   │   ├── db.js                   # MongoDB connection
│   │   │   └── loggerConfig.js         # Winston logger
│   │   │
│   │   ├── controllers/
│   │   │   ├── admin.customers.controller.js
│   │   │   ├── admin.reviews.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   ├── auth.controller.js
│   │   │   ├── favorites.controller.js
│   │   │   ├── menu.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── profile.controller.js
│   │   │   ├── review.controller.js
│   │   │   └── tts.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js      # JWT + API key guards
│   │   │   ├── errorHandler.js         # Global error handler
│   │   │   └── upload.middleware.js    # Multer + Cloudinary
│   │   │
│   │   ├── models/
│   │   │   ├── Favorite.js
│   │   │   ├── MenuItem.js
│   │   │   ├── Order.js
│   │   │   ├── Review.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── admin.routes.js         # /api/v1/admin/*
│   │   │   ├── analytics.routes.js     # /api/v1/analytics/*
│   │   │   ├── auth.routes.js          # /api/v1/auth/*
│   │   │   ├── favorites.routes.js     # /api/v1/favorites/*
│   │   │   ├── menu.routes.js          # /api/v1/menu/*
│   │   │   ├── order.routes.js         # /api/v1/orders/*
│   │   │   ├── profile.routes.js       # /api/v1/profile/*
│   │   │   ├── review.routes.js        # /api/v1/reviews/*
│   │   │   └── tts.routes.js           # /api/v1/tts/*
│   │   │
│   │   ├── services/
│   │   │   ├── admin.customers.service.js
│   │   │   ├── admin.reviews.service.js
│   │   │   ├── analytics.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── email.service.js
│   │   │   ├── favorites.service.js
│   │   │   ├── menu.service.js
│   │   │   ├── order.service.js
│   │   │   ├── profile.service.js
│   │   │   ├── review.service.js
│   │   │   └── tts.service.js
│   │   │
│   │   ├── scripts/
│   │   │   ├── seedAdmin.js            # Create default admin user
│   │   │   ├── seedMenu.js             # Seed menu items
│   │   │   └── backfillVoiceOrderCustomers.js
│   │   │
│   │   ├── utils/
│   │   │   ├── apiResponse.js          # Standardised response helpers
│   │   │   ├── AppError.js             # Custom error class
│   │   │   └── phone.js                # Phone normalisation
│   │   │
│   │   ├── validators/                 # express-validator rule sets
│   │   ├── app.js                      # Express app setup
│   │   └── server.js                   # HTTP server entry point
│   │
│   ├── .env                            # Environment variables (not committed)
│   └── package.json
│
├── 📂 frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   │   ├── AdminLayout/        # Main admin shell
│   │   │   │   ├── Sidebar/            # Navigation with real pending badge
│   │   │   │   └── TopNavbar/          # Header with notifications
│   │   │   └── styles/
│   │   │       └── admin.variables.css # Design tokens (dark theme + gold)
│   │   │
│   │   ├── api/
│   │   │   └── api.js                  # Axios instance with auth interceptor
│   │   │
│   │   ├── components/                 # Shared UI components
│   │   │   ├── CartDrawer/
│   │   │   ├── CategorySelector/       # Searchable category dropdown
│   │   │   ├── MenuCard/
│   │   │   ├── Reviews/
│   │   │   └── ...
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # JWT auth state
│   │   │   └── CartContext.jsx         # Shopping cart state
│   │   │
│   │   ├── pages/
│   │   │   ├── Admin/                  # Admin entry page
│   │   │   ├── AdminMenu/              # Menu management
│   │   │   ├── AiOrders/               # Voice orders view
│   │   │   ├── Analytics/              # Real-data analytics dashboard
│   │   │   ├── Customers/              # Real customer insights
│   │   │   ├── Dashboard/              # Admin overview
│   │   │   ├── Orders/                 # Order management
│   │   │   ├── Reviews/                # Real reviews management
│   │   │   ├── Home/                   # Customer homepage
│   │   │   ├── Menu/                   # Customer menu page
│   │   │   ├── Cart/                   # Shopping cart
│   │   │   ├── OrderHistory/           # Customer order history
│   │   │   ├── OrderDetails/           # Single order detail
│   │   │   ├── Favorites/              # Saved dishes
│   │   │   ├── Profile/                # Customer profile
│   │   │   ├── Login/ Register/        # Auth pages
│   │   │   └── ...
│   │   │
│   │   ├── services/                   # API service modules
│   │   │   ├── analyticsService.js
│   │   │   ├── customerService.js
│   │   │   ├── menuService.js
│   │   │   ├── orderService.js
│   │   │   ├── reviewService.js
│   │   │   └── ...
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   └── VoiceAssistant/
│   │       └── VoiceAssistant.jsx      # VAPI voice UI component
│   │
│   ├── .env                            # Frontend env (VITE_API_URL)
│   └── package.json
│
├── .env.example                        # Environment variable template
├── TESTING_GUIDE.md                    # Full API & frontend testing guide
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or newer
- **npm** 9 or newer
- A **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A **Cloudinary** account for image uploads
- An **EmailJS** account for transactional emails

### 1. Clone the repository

```bash
git clone https://github.com/Siraut12321/FYP-AI-Restaurant-Management-System-.git
cd FYP-AI-Restaurant-Management-System-
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example backend/.env
```

See the [Environment Variables](#-environment-variables) section for all required keys.

### 4. Seed the database

```bash
cd backend

# Create the default admin account
npm run seed:admin

# Seed the initial menu items
npm run seed:menu
```

### 5. Run the application

Open two terminals:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend
npm run dev
```

### 6. Verify the backend is running

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "environment": "development"
}
```

---

## 🔐 Environment Variables

### Backend — `backend/.env`

```env
# ── App ──────────────────────────────────────────────────────
NODE_ENV=development
PORT=5000

# ── MongoDB ──────────────────────────────────────────────────
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/restaurant_ai

# ── JWT ──────────────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# ── Voice Order Security ──────────────────────────────────────
VOICE_ORDER_API_KEY=your-secret-key-here

# ── Cloudinary ───────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── OpenAI TTS ───────────────────────────────────────────────
OPENAI_API_KEY=sk-...
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=alloy
OPENAI_TTS_MAX_TEXT_LENGTH=1000

# ── CORS ─────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# ── EmailJS ──────────────────────────────────────────────────
EMAILJS_SERVICE_ID=service_xxxxxxx
EMAILJS_WELCOME_TEMPLATE_ID=template_xxxxxxx
EMAILJS_ORDER_TEMPLATE_ID=template_xxxxxxx
EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key

# ── n8n Webhook (optional) ────────────────────────────────────
N8N_STATUS_WEBHOOK=https://your-n8n-instance.cloud/webhook/your-id
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_TTS_API_URL=http://localhost:5000/api/v1/tts
```

> ⚠️ **Never commit `.env` files.** They are listed in `.gitignore`.

---

## 📡 API Reference

All endpoints are prefixed with `/api/v1`.

### 🔑 Authentication — `/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new customer (Gmail only) |
| POST | `/auth/login` | Public | Login and receive JWT (Gmail only) |
| POST | `/auth/logout` | Public | Clear auth cookie |
| GET | `/auth/me` | JWT | Get current user info |
| POST | `/auth/forgot-password` | Public | Send 6-digit reset code to email |
| POST | `/auth/reset-password` | Public | Reset password using the code |

### 🍽️ Menu — `/menu`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/menu` | Public | Get all menu items (filterable) |
| GET | `/menu/categories` | Public | Get all distinct categories |
| GET | `/menu/:id` | Public | Get a single menu item |
| POST | `/menu` | Admin | Create a menu item (with image) |
| PATCH | `/menu/:id` | Admin | Update a menu item |
| DELETE | `/menu/:id` | Admin | Delete a menu item |
| PATCH | `/menu/:id/toggle-availability` | Admin | Toggle availability |
| PATCH | `/menu/:id/toggle-featured` | Admin | Toggle featured status |

### 📦 Orders — `/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Optional JWT | Place a guest or authenticated website order; email and Cash on Delivery are required |
| POST | `/orders/voice` | API Key | Place a voice order (VAPI/n8n) |
| GET | `/orders/my-orders` | JWT | Get current customer's orders |
| GET | `/orders/:id` | JWT | Get a single order |
| GET | `/orders/:id/tracking` | JWT | Get order tracking timeline |
| GET | `/orders` | Admin | Get all orders |
| PATCH | `/orders/:id/status` | Admin | Update order status |
| DELETE | `/orders/:id` | Admin | Delete an order |

### 👤 Profile — `/profile`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | JWT | Get profile + total order count |
| PATCH | `/profile` | JWT | Update name, phone, address, avatar |

### ❤️ Favorites — `/favorites`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/favorites` | JWT | List favourited menu items |
| POST | `/favorites/:menuId` | JWT | Add to favourites |
| DELETE | `/favorites/:menuId` | JWT | Remove from favourites |
| GET | `/favorites/:menuId/check` | JWT | Check if item is favourited |

### ⭐ Reviews — `/reviews`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/reviews/:menuItemId` | Public | Get reviews for a menu item |
| POST | `/reviews` | JWT customer | Submit a review with a valid menu item, required integer rating from 1–5, and optional text |
| PATCH | `/reviews/:id` | JWT | Edit own review |
| DELETE | `/reviews/:id` | JWT | Delete own review |

### 📊 Analytics — `/analytics`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analytics/dashboard` | Admin | Full dashboard stats from MongoDB |

### 🛡️ Admin — `/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/customers` | Admin | All customers with real order stats |
| GET | `/admin/reviews` | Admin | All reviews with sentiment analysis |

### 🔊 TTS — `/tts`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/tts/speak` | JWT | Generate speech audio via OpenAI TTS |

---

## 🖥️ Admin Panel

The admin panel is accessible at `/admin` and requires an account with `role: admin`.

### Dashboard
Real-time overview cards: total revenue, today's revenue, total orders, pending orders, total customers, and menu item count. Includes recent orders table and quick-action links.

### 📊 Analytics
Fully database-driven analytics including:
- **Overview cards** — Total Revenue, Today's Revenue, Total Orders, Avg Order Value, Total Customers, Completed / Pending / Cancelled Orders
- **Website vs Voice** — Order count and revenue split by `orderSource`, with a visual percentage bar
- **Category Performance** — Revenue and order count per menu category with progress bars
- **Top Dishes** — Top 5 dishes by quantity ordered with revenue
- **Order Status Breakdown** — Live counts for all 5 statuses
- **Last 7 Days Sales** — Daily revenue and order count with visual bars

### 👥 Customers
Real customer data from MongoDB:
- Summary cards: Total Customers, Active (ordered in last 30 days), Inactive, Total Orders, Total Revenue, Avg Spending
- Top Spender highlight card
- Full customer list with name, email, phone, order count, spending, and active/inactive badge

### ⭐ Reviews
Real reviews from MongoDB with:
- Summary: Average Rating, Total Reviews, Positive, Negative counts
- Filter by star rating or sentiment
- Each card shows customer name, date, star rating, review text, dish tag, and sentiment badge

### 📋 Orders
All orders from both website and voice channels. Filter, search, and update order status. Status changes optionally trigger the n8n webhook.

### 🍽️ Menu Management
Full CRUD for menu items with Cloudinary image upload, category assignment via searchable dropdown, availability toggle, and featured toggle.

### 🔔 Notifications
The Orders sidebar badge shows the real count of pending orders fetched from the analytics endpoint. No hardcoded values.

---

## 🎙️ Voice Ordering (VAPI + n8n)

The voice ordering system allows customers to place orders through a natural Urdu-language phone call.

### How it works

```
Customer calls VAPI number
        ↓
VAPI AI handles Urdu conversation
        ↓
VAPI sends order data to n8n webhook
        ↓
n8n workflow processes and validates the order
        ↓
n8n calls POST /api/v1/orders/voice with x-api-key header
        ↓
Backend validates, prices, and saves the order to MongoDB
        ↓
EmailJS sends order confirmation email
        ↓
Order appears in Admin Panel alongside website orders
```

### Voice Order Request

```http
POST /api/v1/orders/voice
x-api-key: <VOICE_ORDER_API_KEY>
Content-Type: application/json
```

```json
{
  "customer": {
    "name": "Ali Khan",
    "phone": "+923001234567"
  },
  "shippingAddress": {
    "fullName": "Ali Khan",
    "phone": "+923001234567",
    "address": "House 15, Gulshan Road",
    "city": "Lahore"
  },
  "orderItems": [
    {
      "menuItem": "<MongoDB ObjectId>",
      "quantity": 2
    }
  ],
  "paymentMethod": "Cash on Delivery"
} Prices are always fetched from MongoDB — the client cannot override them.

### n8n Order Status Webhook

When `N8N_STATUS_WEBHOOK` is configured, the backend sends a POST request to that URL every time an admin updates an order's status:

```json
{
  "orderId": "<order id>",
  "status": "Pending | Preparing | Ready | Delivered | Cancelled",
  "customerName": "Full Name",
  "phone": "+923001234567",
  "email": "customer@email.com"
}
```

Webhook failures are logged but never block the status update.

---

## 📧 Email Notifications

The system uses **EmailJS** (Node SDK) for two transactional email flows:

| Trigger | Template | Content |
|---|---|---|
| Customer registers | Welcome template | Welcome message with restaurant name |
| Order placed (website or voice) | Order template | Order ID, items, total, shipping address, payment method |

Email delivery is **non-blocking** — if EmailJS fails, the registration or order creation still succeeds. Errors are logged via Winston.

---

## 📜 Scripts

Run from the `backend/` directory:

```bash
# Start production server
npm start

# Start development server with hot reload
npm run dev

# Seed the default admin account
npm run seed:admin

# Seed initial menu items (20 items across 8 categories)
npm run seed:menu

# Backfill voice orders to link them to matching customer accounts
npm run backfill:voice-customers
```

---

## 🔑 Default Credentials

After running `npm run seed:admin`:

| Field | Value |
|---|---|
| Email | `admin@restaurant.com` |
| Password | `Admin@1234` |
| Role | `admin` |

> ⚠️ Change the admin password immediately in any production deployment.

---

## ✅ Validation Rules

### Authentication
| Field | Rule |
|---|---|
| Email (register & login) | Must end with `@gmail.com` exactly. Yahoo, Hotmail, Outlook etc. are rejected. |
| Password (register & login) | Minimum 9 characters, maximum 12 characters. |
| Confirm Password | Must exactly match the password field. |

### Phone Numbers
| Field | Rule |
|---|---|
| Profile phone | Pakistani mobile format: `03XXXXXXXXX` — exactly 11 digits starting with `03`. |
| Checkout shipping phone | Same rule: `^03[0-9]{9}$`. |
| Voice order shipping phone | Same rule enforced at backend validator level. |

### Orders
| Field | Rule |
|---|---|
| Payment Method | Only `Cash on Delivery` is accepted. Card and Online are rejected at both frontend and backend. |
| Checkout email | Required for website orders; must be a valid Gmail address or the configured admin email. Stored with the shipping address for guest confirmation. |
| City field | Alphabetic characters and spaces only — numbers and special characters are blocked. |

### Reviews
| Field | Rule |
|---|---|
| Authentication | Only authenticated customer requests may create, edit, or delete reviews. Customer identity is taken from the JWT. |
| Menu item | Must be a valid existing MongoDB `MenuItem` ID. |
| Rating | Required integer from `1` to `5`; rating-only reviews are accepted. |
| Review text | Optional, maximum 1,000 characters. |
| Duplicate reviews | A customer can submit at most one review per menu item. |

All validation is enforced on **both frontend and backend**. Backend validation uses `express-validator` and cannot be bypassed by direct API calls.

---

## 🧪 Testing

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for the full testing checklist covering:
- Authentication flows
- Profile API
- Order creation (website and voice)
- Guest checkout email validation and post-order confirmation behavior
- Order tracking
- Favorites
- Homepage and menu-item reviews, including guest login draft restoration
- Admin panel pages
- Frontend build verification
- Regression checklist

### Quick checks

```bash
# Frontend production build
cd frontend
npm run build

# Backend health check
curl http://localhost:5000/api/v1/health

# Backend syntax check
cd backend
node --check src/app.js
node --check src/services/analytics.service.js
node --check src/services/admin.customers.service.js
node --check src/services/admin.reviews.service.js
```

---

## 🔮 Future Enhancements

- 🤖 AI-powered dish recommendation engine based on order history
- 📱 Progressive Web App (PWA) support for mobile customers
- 🔴 Real-time order status updates via WebSockets
- 📊 Advanced analytics with chart visualisations (Recharts / Chart.js)
- 🗓️ Table reservation system
- 🎟️ Coupon and discount code management
- 📦 Smart inventory tracking and low-stock alerts
- 🌍 Multi-language support beyond Urdu
- 💳 Online payment gateway integration (Stripe / JazzCash)
- 📲 WhatsApp / SMS order notifications via n8n

---

## 👥 Contributors

| Name | Role |
|---|---|
| FYP Team | Full-stack development, AI integration, system design |

---

## 📄 License

This project is developed for **academic purposes** as a Final Year Project. All rights reserved by the project authors.

---

<div align="center">

**🍽️ Hot & Spicy — Where AI Meets Authentic Flavour**

*Built with ❤️ as a Final Year Project*

</div>
