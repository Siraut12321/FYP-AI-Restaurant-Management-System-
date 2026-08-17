# AI-Powered Restaurant Management System

A modern full-stack restaurant management platform designed to streamline ordering, menu management, customer interactions, and business analytics. The system combines a React-based frontend with a Node.js/Express backend and MongoDB database, with a strong focus on a polished UI, role-based access, and AI-ready restaurant workflows.

## Overview

This project provides a complete foundation for a smart restaurant ecosystem with:

- Customer-facing menu browsing and ordering
- Admin panel for menu and order management
- Authentication and role-based access control
- Favorites and personalized customer features
- Sales and analytics dashboards
- Voice-assistant-oriented architecture for future AI-driven ordering

## Key Features

### Customer Experience
- Browse featured dishes and menu categories
- Manage profile details, contact information, and Cloudinary avatar uploads
- View order history with item details, totals, payment method, and status
- Track order progress from pending through delivered or cancelled
- Save and remove favorite dishes
- View average ratings and customer reviews for menu items
- Add, edit, and delete reviews for purchased dishes
- Responsive, modern UI for desktop and mobile

### Admin Experience
- Manage menu items, availability, and images
- Review and update order status
- Monitor restaurant performance through analytics
- Secure admin and customer access separation
- Access voice-originated orders in the same order list as website orders

### Voice Ordering Integration
- Machine-to-machine order creation via VAPI and n8n
- Secure API-key validation for external voice systems
- Voice orders saved to the same MongoDB Order collection as website purchases
- Server-side pricing and order-state enforcement for trusted backend control
- Existing JWT customer flow preserved without changing website checkout behavior

### Technical Highlights
- RESTful API backend with Express
- MongoDB data modeling for users, menus, orders, favorites, and reviews
- JWT-based authentication
- Voice order API security with `x-api-key`
- Cloudinary integration for image uploads
- Resend API for welcome and order confirmation emails
- Vite-powered React frontend for fast development

## Customer Experience API

All customer endpoints require the existing JWT authentication unless noted otherwise.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/v1/profile` | Get the logged-in customer's profile and total order count |
| PATCH | `/api/v1/profile` | Update name, phone, address, or avatar |
| POST | `/api/v1/orders` | Create a standard website order with JWT authentication |
| GET | `/api/v1/orders/my-orders` | Get the logged-in customer's order history |
| GET | `/api/v1/orders/:id` | Get an authorized order's details |
| GET | `/api/v1/orders/:id/tracking` | Get live status, timeline, and preparation estimate |
| POST | `/api/v1/orders/voice` | Create a voice-initiated order using API-key authentication |
| POST | `/api/v1/favorites/:menuId` | Add a menu item to favorites |
| GET | `/api/v1/favorites` | List the customer's favorite menu items |
| DELETE | `/api/v1/favorites/:menuId` | Remove a menu item from favorites |
| GET | `/api/v1/reviews/:menuItemId` | Get paginated reviews and rating summary |
| POST | `/api/v1/reviews` | Review a dish purchased by the customer |
| PATCH | `/api/v1/reviews/:id` | Edit the customer's own review |
| DELETE | `/api/v1/reviews/:id` | Delete the customer's own review |

Customers can access the frontend flows at `/profile`, `/orders`, `/favorites`, and `/orders/:id`.

### Voice Order API
The voice order endpoint is intended for VAPI/n8n machine-to-machine calls and does not require JWT authentication.

Required header:

```http
x-api-key: <VOICE_ORDER_API_KEY>
```

Example request body:

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
      "menuItem": "MONGODB_MENU_ITEM_ID",
      "quantity": 2
    }
  ],
  "paymentMethod": "Cash on Delivery"
}
```

The backend is authoritative for pricing, status, and order source. Voice orders are saved into the same Order collection and appear in the existing admin order list.

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Framer Motion
- Axios

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary
- Multer
- Winston logging

## Project Structure

```text
restaurant-ai-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── services/
│   └── package.json
└── README.md
```

See [TESTING_GUIDE.md](TESTING_GUIDE.md) for API, frontend, authentication, error-state, and regression testing steps.

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- MongoDB instance running locally or remotely
- Cloudinary account for image uploads

### 1. Clone the repository
```bash
git clone https://github.com/Siraut12321/FYP-AI-Restaurant-Management-System-.git
cd FYP-AI-Restaurant-Management-System-
```

### 2. Install dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables
Create a `.env` file inside the backend directory with values similar to:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
VOICE_ORDER_API_KEY=your_voice_api_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=hello@yourdomain.com
```

Add the following optional webhook variable to forward admin order status changes to an n8n workflow (POST JSON):

```env
N8N_STATUS_WEBHOOK=https://example.n8n.cloud/webhook/your-webhook-id
```

The backend uses Resend for the welcome email and order confirmation email flow. The sender address is set via `RESEND_FROM_EMAIL`, and email delivery is non-blocking so registration and order creation still succeed even if the email request fails.

The `VOICE_ORDER_API_KEY` is used only for the machine-to-machine voice order endpoint and must never be exposed to the frontend.

### 4. Run the application
Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend:
```bash
cd frontend
npm run dev
```

### 5. Seed initial data
```bash
cd backend
npm run seed:admin
npm run seed:menu
```

## Default Admin Credentials
After seeding the admin account:
- Email: admin@restaurant.com
- Password: Admin@1234

## Future Enhancements
- AI recommendation engine for dishes and promotions
- Smart inventory forecasting
- Real-time delivery and kitchen workflow automation
- Expansion of AI call center and multi-channel order workflows

## License
This project is for academic and development purposes as part of a final year project.

## Contributors
- FYP Team

## n8n Order Status Webhook

If you configure `N8N_STATUS_WEBHOOK`, the backend will POST a JSON payload to that URL every time an admin updates an order's `orderStatus`. Failures when calling the webhook are logged but do not prevent the status update from succeeding.

Payload (Content-Type: application/json):

```json
{
  "orderId": "<order id string>",
  "status": "Pending|Preparing|Ready|Delivered|Cancelled",
  "customerName": "Full Name or empty string",
  "phone": "Phone number or empty string",
  "email": "Customer email or empty string"
}
```

Use this webhook to trigger downstream automations (SMS, WhatsApp, kitchen display, etc.).
