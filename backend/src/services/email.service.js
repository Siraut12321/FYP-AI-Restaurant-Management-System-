import nodemailer from 'nodemailer';

const hasSmtpConfig = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.EMAIL_FROM
);

const buildTransporter = () => {
  if (!hasSmtpConfig()) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const formatOrderId = (orderId) => {
  if (!orderId) return 'N/A';
  return String(orderId).slice(-8).toUpperCase();
};

export const sendWelcomeEmail = async (user) => {
  if (!user?.email) {
    console.warn('Welcome email skipped: missing user email.');
    return;
  }

  if (!hasSmtpConfig()) {
    console.info('Welcome email skipped: SMTP is not configured.');
    return;
  }

  const transporter = buildTransporter();
  if (!transporter) return;

  const name = user.name || 'Customer';
  const bodyText = `Welcome to Hot & Spicy Restaurant, ${name}! 🍕\n\nThank you for creating your account with us.\n\nYour account has been successfully created and you're now ready to explore our menu, place orders, and enjoy your favorite meals.\n\nWe’re happy to have you with us!\n\nBest regards,\nHot & Spicy Restaurant`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#fffaf0;color:#1a1a1a;padding:24px;border-radius:12px;border:1px solid #f4d19b;">
      <h2 style="margin:0 0 16px;color:#d97706;">Welcome to Hot & Spicy Restaurant! 🍕</h2>
      <p style="font-size:16px;line-height:1.6;">Welcome to Hot & Spicy Restaurant, <strong>${name}</strong>! 🍕</p>
      <p style="font-size:16px;line-height:1.6;">Thank you for creating your account with us.</p>
      <p style="font-size:16px;line-height:1.6;">Your account has been successfully created and you're now ready to explore our menu, place orders, and enjoy your favorite meals.</p>
      <p style="font-size:16px;line-height:1.6;">We’re happy to have you with us!</p>
      <p style="margin-top:24px;font-size:14px;color:#444;">Best regards,<br/>Hot & Spicy Restaurant</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Hot & Spicy Restaurant! 🍕',
    text: bodyText,
    html,
  });
};

export const sendOrderConfirmationEmail = async (order) => {
  if (!order) return;

  if (!hasSmtpConfig()) {
    console.info('Order confirmation email skipped: SMTP is not configured.');
    return;
  }

  const customer = order.customer && typeof order.customer === 'object' ? order.customer : null;
  const customerEmail = customer?.email || null;

  if (!customerEmail) {
    console.warn('Order confirmation email skipped: customer email not found for order.', { orderId: order._id?.toString?.() || 'unknown' });
    return;
  }

  const transporter = buildTransporter();
  if (!transporter) return;

  const customerName = customer?.name || order.customerDetails?.name || order.shippingAddress?.fullName || 'Customer';
  const orderId = formatOrderId(order._id);
  const estimatedDelivery = '35–45 minutes';
  const itemsText = (order.orderItems || []).map((item) => {
    const itemName = item.dishName || 'Item';
    const quantity = item.quantity || 0;
    const subtotal = Number(item.subtotal || 0);
    const price = Number(item.price || 0);
    return `• ${itemName} × ${quantity} — PKR ${subtotal} (PKR ${price} each)`;
  }).join('\n');

  const totalAmount = Number(order.totalAmount || 0);
  const paymentMethod = order.paymentMethod || 'Not specified';
  const address = order.shippingAddress?.address || 'Not provided';
  const city = order.shippingAddress?.city || 'Not provided';
  const orderStatus = order.orderStatus || 'Pending';

  const textBody = `Hello ${customerName},\n\nThank you for ordering from Hot & Spicy Restaurant! 🍕\n\nYour order has been successfully confirmed.\n\nORDER DETAILS\n────────────────────────\n\nOrder ID: ${orderId}\n\nItems:\n${itemsText}\n\nTotal: PKR ${totalAmount}\n\nPayment: ${paymentMethod}\n\nDelivery Address:\n${address}, ${city}\n\nStatus: ${orderStatus}\n\nEstimated Delivery:\n${estimatedDelivery}\n\nThank you for ordering from Hot & Spicy Restaurant! ❤️\n\nWe hope you enjoy your meal!`;

  const htmlItems = (order.orderItems || []).map((item) => {
    const itemName = item.dishName || 'Item';
    const quantity = item.quantity || 0;
    const subtotal = Number(item.subtotal || 0);
    return `
      <tr>
        <td style="padding:8px 0; border-bottom:1px solid #f0d7a3; color:#1f2937;">${itemName}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f0d7a3; color:#1f2937;">${quantity}</td>
        <td style="padding:8px 0; border-bottom:1px solid #f0d7a3; color:#1f2937;">PKR ${subtotal}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;background:#fffaf0;color:#111827;padding:24px;border-radius:12px;border:1px solid #f4d19b;">
      <h2 style="margin:0 0 12px;color:#b45309;">Order Confirmed — Hot & Spicy Restaurant 🍕</h2>
      <p>Hello <strong>${customerName}</strong>,</p>
      <p>Thank you for ordering from Hot & Spicy Restaurant! 🍕</p>
      <p>Your order has been successfully confirmed.</p>

      <h3 style="margin:20px 0 12px;color:#111827;">ORDER DETAILS</h3>
      <p><strong>Order ID:</strong> ${orderId}</p>

      <table style="width:100%;border-collapse:collapse;margin-top:12px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 0;color:#1f2937;border-bottom:1px solid #f0d7a3;">Item</th>
            <th style="text-align:left;padding:8px 0;color:#1f2937;border-bottom:1px solid #f0d7a3;">Qty</th>
            <th style="text-align:left;padding:8px 0;color:#1f2937;border-bottom:1px solid #f0d7a3;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${htmlItems}
        </tbody>
      </table>

      <p style="margin-top:16px;"><strong>Total:</strong> PKR ${totalAmount}</p>
      <p><strong>Payment:</strong> ${paymentMethod}</p>
      <p><strong>Delivery Address:</strong> ${address}, ${city}</p>
      <p><strong>Status:</strong> ${orderStatus}</p>
      <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
      <p style="margin-top:20px;">Thank you for ordering from Hot & Spicy Restaurant! ❤️</p>
      <p>We hope you enjoy your meal!</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: customerEmail,
    subject: 'Order Confirmed — Hot & Spicy Restaurant 🍕',
    text: textBody,
    html,
  });
};
