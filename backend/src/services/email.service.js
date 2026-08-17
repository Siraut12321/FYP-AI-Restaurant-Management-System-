import { createRequire } from 'node:module';

// EmailJS publishes a broken ESM build for this runtime, but the CJS entry works
// reliably in this project. Use the CommonJS bridge so the server can boot.
const require = createRequire(import.meta.url);
const emailjs = require('@emailjs/nodejs');

// ─── EmailJS Configuration ────────────────────────────────────────────────────
const initEmailJS = () => {
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  console.info('ORDER EMAIL: EmailJS configuration detected', {
    hasServiceId: Boolean(process.env.EMAILJS_SERVICE_ID),
    hasPublicKey: Boolean(publicKey),
    hasPrivateKey: Boolean(privateKey),
    hasWelcomeTemplateId: Boolean(process.env.EMAILJS_WELCOME_TEMPLATE_ID),
    hasOrderTemplateId: Boolean(process.env.EMAILJS_ORDER_TEMPLATE_ID),
  });

  if (!publicKey || !privateKey) {
    console.warn('EmailJS configuration incomplete: public or private key missing.');
    return false;
  }

  emailjs.init({
    publicKey,
    privateKey,
    limitRate: {
      id: 'app',
      throttle: 50, // ms
    },
  });

  return true;
};

const hasEmailJSConfig = () => Boolean(
  process.env.EMAILJS_SERVICE_ID &&
  process.env.EMAILJS_PUBLIC_KEY &&
  process.env.EMAILJS_PRIVATE_KEY &&
  process.env.EMAILJS_WELCOME_TEMPLATE_ID &&
  process.env.EMAILJS_ORDER_TEMPLATE_ID
);

const formatOrderId = (orderId) => {
  if (!orderId) return 'N/A';
  return String(orderId).slice(-8).toUpperCase();
};

const getSafeErrorDetails = (error) => {
  const details = {
    name: error?.name || null,
    message: error?.message || null,
    code: error?.code || null,
    type: error?.type || null,
    status: error?.status ?? null,
    statusCode: error?.statusCode ?? null,
    responseStatus: error?.response?.status ?? null,
    responseText: null,
    responseData: null,
    stack: null,
  };

  if (error?.response) {
    if (typeof error.response?.status === 'number') {
      details.responseStatus = error.response.status;
    }

    if (error.response?.data !== undefined) {
      details.responseData = error.response.data;
    }

    if (error.response?.text !== undefined) {
      details.responseText = error.response.text;
    }
  }

  if (error?.text !== undefined) {
    details.responseText = error.text;
  }

  if (typeof error?.stack === 'string') {
    const redactedStack = error.stack
      .replace(/(EMAILJS_PRIVATE_KEY|EMAILJS_PUBLIC_KEY|PRIVATE_KEY|PUBLIC_KEY|authorization|Authorization|cookie|Cookie|token|Token|api[_-]?key|API[_-]?KEY)=?[^\s\r\n]+/gi, '$1=[REDACTED]')
      .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED]');

    details.stack = redactedStack.length > 2000 ? redactedStack.slice(0, 2000) : redactedStack;
  }

  return details;
};

export const sendWelcomeEmail = async (user) => {
  if (!user?.email) {
    console.warn('Welcome email skipped: missing user email.');
    return;
  }

  if (!hasEmailJSConfig()) {
    console.info('Welcome email skipped: EmailJS is not configured.');
    return;
  }

  const name = user.name || 'Customer';

  try {
    if (!initEmailJS()) {
      console.error('Welcome email skipped: EmailJS initialization failed.');
      return;
    }

    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_WELCOME_TEMPLATE_ID,
      {
        name,
        email: user.email,
      }
    );

    console.log('Welcome email sent successfully to:', user.email);
  } catch (error) {
    console.error('Welcome email send failed:', getSafeErrorDetails(error));
  }
};

export const sendOrderConfirmationEmail = async (order) => {
  if (!order) {
    console.warn('Order confirmation email skipped: no order provided.');
    return;
  }

  const configStatus = {
    hasServiceId: Boolean(process.env.EMAILJS_SERVICE_ID),
    hasPublicKey: Boolean(process.env.EMAILJS_PUBLIC_KEY),
    hasPrivateKey: Boolean(process.env.EMAILJS_PRIVATE_KEY),
    hasOrderTemplateId: Boolean(process.env.EMAILJS_ORDER_TEMPLATE_ID),
  };

  if (!hasEmailJSConfig()) {
    console.info('ORDER EMAIL: EmailJS config missing', configStatus);
    console.info('Order confirmation email skipped: EmailJS is not configured.');
    return;
  }

  // Resolve customer email
  const customer = order.customer && typeof order.customer === 'object' ? order.customer : null;
  const customerEmail = customer?.email || order.shippingAddress?.email || null;

  console.info('ORDER EMAIL: customer email check', {
    orderId: order._id?.toString?.() || 'unknown',
    hasCustomer: Boolean(customer),
    hasCustomerEmail: Boolean(customerEmail),
    hasShippingEmail: Boolean(order.shippingAddress?.email),
  });

  if (!customerEmail) {
    console.warn('Order confirmation email skipped: customer email not found for order.', {
      orderId: order._id?.toString?.() || 'unknown',
      hasCustomer: Boolean(customer),
      hasCustomerDetails: Boolean(order.customerDetails),
    });
    return;
  }

  try {
    // Initialize EmailJS on each call
    if (!initEmailJS()) {
      console.error('Order confirmation email skipped: EmailJS initialization failed.');
      return;
    }

    // Format order ID for display
    const orderId = formatOrderId(order._id);

    const orderItemsForEmail = (order.orderItems || []).map((item) => ({
      image_url: item.menuItem?.image || item.image_url || null,
      name: item.dishName || item.menuItem?.dishName || null,
      units: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
    }));

    const shipping = Number(order.shippingFee ?? order.shippingAmount ?? 0);
    const tax = Number(order.tax ?? order.taxAmount ?? 0);
    const total = Number(order.totalAmount ?? 0);

    const templateParams = {
      order_id: orderId,
      email: customerEmail,
      orders: orderItemsForEmail,
      cost: {
        shipping,
        tax,
        total,
      },
    };

    console.info('ORDER EMAIL: payload preview before send', {
      order_id: orderId,
      orderItemCount: orderItemsForEmail.length,
      firstItemName: orderItemsForEmail[0]?.name || null,
      firstItemPrice: orderItemsForEmail[0]?.price ?? null,
      firstItemQuantity: orderItemsForEmail[0]?.units ?? null,
      hasImageUrl: Boolean(orderItemsForEmail[0]?.image_url),
      shipping,
      tax,
      total,
      hasCustomerEmail: Boolean(customerEmail),
    });

    console.info('ORDER EMAIL: attempting EmailJS send', {
      orderId: order._id?.toString?.() || 'unknown',
      hasCustomerEmail: Boolean(customerEmail),
      templateIdPresent: Boolean(process.env.EMAILJS_ORDER_TEMPLATE_ID),
      serviceIdPresent: Boolean(process.env.EMAILJS_SERVICE_ID),
    });

    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_ORDER_TEMPLATE_ID,
      templateParams
    );

    console.log('ORDER EMAIL: EmailJS response received', {
      orderId: order._id?.toString?.() || 'unknown',
      status: result?.status || 'unknown',
      id: result?.id || null,
    });
    console.log('Order confirmation email sent successfully to:', customerEmail);
  } catch (error) {
    // Log error but do NOT throw - order must remain created
    console.error('ORDER EMAIL: send failed', {
      orderId: order._id?.toString?.() || 'unknown',
      ...getSafeErrorDetails(error),
    });
  }
};
