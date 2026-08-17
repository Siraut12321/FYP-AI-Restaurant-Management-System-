import assert from 'node:assert/strict';
import { sendWelcomeEmail, sendOrderConfirmationEmail, resend } from './email.service.js';

process.env.RESEND_API_KEY = 're_test_123';
process.env.RESEND_FROM_EMAIL = 'hello@demo.test';

const originalSend = resend.emails.send;
const sent = [];

try {
  resend.emails.send = async (payload) => {
    sent.push(payload);
    return { data: { id: 'mock-email-id' }, error: null };
  };

  await sendWelcomeEmail({ name: 'Alice', email: 'alice@example.com' });
  assert.equal(sent.length, 1, 'Welcome email should be attempted once');
  assert.equal(sent[0].to, 'alice@example.com');
  assert.match(sent[0].subject, /Welcome to Hot & Spicy Restaurant/);
  assert.match(sent[0].html, /Welcome to Hot & Spicy Restaurant/);

  const order = {
    _id: '507f1f77bcf86cd799439011',
    customer: { name: 'Bob', email: 'bob@example.com' },
    orderItems: [
      { dishName: 'Butter Chicken', quantity: 2, subtotal: 800, price: 400 },
    ],
    shippingAddress: { address: '123 Main Street', city: 'Lahore' },
    totalAmount: 800,
    paymentMethod: 'Cash',
    orderStatus: 'Pending',
  };

  await sendOrderConfirmationEmail(order);
  assert.equal(sent.length, 2, 'Order confirmation email should be attempted once');
  assert.equal(sent[1].to, 'bob@example.com');
  assert.match(sent[1].subject, /Order Confirmed/);
  assert.match(sent[1].text, new RegExp(`Order ID: ${String(order._id).slice(-8).toUpperCase()}`));
  assert.match(sent[1].html, /Order Confirmed — Hot & Spicy Restaurant/);

  console.log('MOCK_EMAIL_TEST=PASS');
} finally {
  resend.emails.send = originalSend;
}
