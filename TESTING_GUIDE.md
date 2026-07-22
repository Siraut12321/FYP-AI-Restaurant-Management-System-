# Customer Experience Module Testing Guide

This guide covers the customer profile, order history, reviews, favorites, and order tracking features.

## 1. Prerequisites

- Node.js 18 or newer
- MongoDB running and configured in `backend/.env`
- Valid JWT configuration in `backend/.env`
- Cloudinary credentials configured for avatar uploads
- A seeded customer account and at least one menu item

Start the applications in separate terminals:

```powershell
cd backend
npm install
npm run dev
```

```powershell
cd frontend
npm install
npm run dev
```

The backend API defaults to `http://localhost:5000/api/v1`. Confirm it is running with:

```powershell
Invoke-RestMethod http://localhost:5000/api/v1/health
```

## 2. Authentication Setup

1. Register or log in as a customer through the frontend.
2. Confirm the browser stores the JWT session.
3. Confirm authenticated requests include `Authorization: Bearer <token>`.
4. Repeat one request with an expired or removed token and verify a `401` response.
5. Confirm admin/staff users cannot access customer-only frontend routes.

## 3. Profile API Tests

Use the logged-in customer token for every request below.

| Method | Endpoint | Expected result |
| --- | --- | --- |
| GET | `/profile` | `200`, customer profile and `totalOrders` |
| PATCH | `/profile` | `200`, updated name/phone/address |
| PATCH | `/profile` with `avatar` multipart field | `200`, Cloudinary avatar URL |
| GET | `/profile` without token | `401` |
| PATCH | `/profile` with invalid phone | `422` |

Verify the profile response never contains `password`. Upload a JPG, PNG, or WEBP image, then confirm the old avatar is replaced when a new image is uploaded.

## 4. Order History and Tracking Tests

1. Place an order containing one or more available menu items.
2. Call `GET /orders/my-orders` and verify only the logged-in customer's orders are returned.
3. Call `GET /orders/:id` and verify items, prices, quantities, subtotals, total, payment method, and status are returned.
4. Call `GET /orders/:id/tracking` and verify current status, order date, timeline, and preparation estimate.
5. Change the order status from the admin interface through `Pending`, `Preparing`, `Ready`, and `Delivered`.
6. Refresh the customer order details page after every status change and verify the timeline updates.
7. Set an order to `Cancelled` and verify the cancelled state is displayed.
8. Try to open another customer's order ID and verify `403`.
9. Open a non-existent or malformed order ID and verify `404` or `422`.

## 5. Favorites Tests

| Action | Endpoint | Expected result |
| --- | --- | --- |
| Add favorite | `POST /favorites/:menuId` | `201`, favorite record |
| List favorites | `GET /favorites` | `200`, populated menu items |
| Check favorite | `GET /favorites/:menuId/check` | `200`, `{ isFavorited: true/false }` |
| Remove favorite | `DELETE /favorites/:menuId` | `200`, removal confirmation |

Also verify:

- Adding the same menu item twice does not create duplicates.
- A customer cannot see another customer's favorites.
- Invalid menu IDs return `422`.
- Unauthenticated favorite actions return `401`.
- The MenuCard heart changes between outline and filled states.
- The Favorites page shows a useful empty state after the final item is removed.

## 6. Review Tests

A customer must have an order containing the menu item before creating a review.

| Method | Endpoint | Expected result |
| --- | --- | --- |
| GET | `/reviews/:menuItemId` | `200`, reviews, average rating, count, pagination |
| POST | `/reviews` | `201` for a purchased item |
| PATCH | `/reviews/:id` | `200` for the review owner |
| DELETE | `/reviews/:id` | `200` for the review owner |

Verify the following cases:

- A customer who has not purchased the dish receives `403`.
- A second review for the same customer/menu item receives `409`.
- Ratings below 1 or above 5 receive `422`.
- Empty comments receive `422`.
- A customer cannot edit or delete another customer's review.
- Review listing returns the customer name/avatar and average rating.
- MenuCard displays the review summary and expandable customer reviews.
- Add, edit, and delete actions show success or error feedback.

## 7. Frontend Route Tests

As an authenticated customer, verify these routes load and call the backend:

- `/profile`
- `/orders`
- `/orders/:id`
- `/favorites`

Verify unauthenticated users are redirected to `/login`, and verify loading, empty, unauthorized, and network-error states are readable on each page.

## 8. Build and Syntax Checks

Run the frontend production build:

```powershell
cd frontend
npm run build
```

Run focused backend syntax checks:

```powershell
cd backend
node --check src/models/Review.js
node --check src/services/review.service.js
node --check src/routes/review.routes.js
node --check src/services/order.service.js
node --check src/controllers/order.controller.js
node --check src/routes/order.routes.js
node --check src/app.js
```

The frontend build should complete successfully. The backend package currently has no ESLint dependency, so `npm run lint` requires ESLint to be installed and configured before it can be used.

## 9. Regression Checklist

- Existing authentication still works.
- Existing menu CRUD still works.
- Existing admin order status updates still work.
- Existing analytics pages still load.
- Cart and checkout still place orders.
- Customer data is scoped by authenticated user ID.
- Passwords are never included in profile responses.
- No customer feature depends on mock customer localStorage data.
