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
- Place and track orders
- Save favorite items
- Responsive, modern UI for desktop and mobile

### Admin Experience
- Manage menu items, availability, and images
- Review and update order status
- Monitor restaurant performance through analytics
- Secure admin and customer access separation

### Technical Highlights
- RESTful API backend with Express
- MongoDB data modeling for users, menus, orders, and favorites
- JWT-based authentication
- Cloudinary integration for image uploads
- Vite-powered React frontend for fast development

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
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

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
- Full Urdu voice-order integration
- AI recommendation engine for dishes and promotions
- Smart inventory forecasting
- Real-time delivery and kitchen workflow automation

## License
This project is for academic and development purposes as part of a final year project.

## Contributors
- FYP Team
