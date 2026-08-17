import 'dotenv/config';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const emailjs = require('@emailjs/nodejs');

const safe = (value) => {
  if (value === undefined || value === null) return value;
  if (typeof value === 'string') {
    return value
      .replace(/(EMAILJS_PRIVATE_KEY|EMAILJS_PUBLIC_KEY|PRIVATE_KEY|PUBLIC_KEY|authorization|Authorization|cookie|Cookie|token|Token|api[_-]?key|API[_-]?KEY)=?[^\s\r\n]+/gi, '$1=[REDACTED]')
      .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED]');
  }

  if (typeof value === 'object') {
    return JSON.parse(JSON.stringify(value, (_key, item) => {
      if (typeof item === 'string') {
        return item
          .replace(/(EMAILJS_PRIVATE_KEY|EMAILJS_PUBLIC_KEY|PRIVATE_KEY|PUBLIC_KEY|authorization|Authorization|cookie|Cookie|token|Token|api[_-]?key|API[_-]?KEY)=?[^\s\r\n]+/gi, '$1=[REDACTED]')
          .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED]');
      }
      return item;
    }));
  }

  return value;
};

const main = async () => {
  const required = {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY,
    templateId: process.env.EMAILJS_ORDER_TEMPLATE_ID,
  };

  console.info('EMAILJS_DIAG: environment check', {
    hasServiceId: Boolean(required.serviceId),
    hasPublicKey: Boolean(required.publicKey),
    hasPrivateKey: Boolean(required.privateKey),
    hasTemplateId: Boolean(required.templateId),
  });

  console.info('EMAILJS_DIAG: SDK export', {
    hasInit: typeof emailjs?.init === 'function',
    hasSend: typeof emailjs?.send === 'function',
    keys: Object.keys(emailjs || {}),
  });

  if (!required.serviceId || !required.publicKey || !required.privateKey || !required.templateId) {
    console.warn('EMAILJS_DIAG: missing required env; aborting without sending.');
    return;
  }

  emailjs.init({
    publicKey: required.publicKey,
    privateKey: required.privateKey,
    limitRate: { id: 'diag', throttle: 50 },
  });

  const recipient = process.env.EMAILJS_TEST_TO || process.env.EMAILJS_ORDER_TO || process.env.EMAILJS_RECIPIENT;

  if (!recipient) {
    console.info('EMAILJS_DIAG: no safe recipient configured; skipping direct send.');
    return;
  }

  const payload = {
    order_id: 'DIAG-TEST',
    email: recipient,
    customer_name: 'Diagnostic Test',
    total: '0.00',
  };

  try {
    const result = await emailjs.send(required.serviceId, required.templateId, payload);
    console.info('EMAILJS_DIAG: send succeeded', safe(result));
  } catch (error) {
    console.error('EMAILJS_DIAG: send failed', {
      name: error?.name || null,
      message: error?.message || null,
      code: error?.code || null,
      type: error?.type || null,
      status: error?.status ?? null,
      statusCode: error?.statusCode ?? null,
      responseStatus: error?.response?.status ?? null,
      responseText: safe(error?.response?.text || error?.text || null),
      responseData: safe(error?.response?.data || null),
      stack: safe(error?.stack || null),
    });
  }
};

main().catch((error) => {
  console.error('EMAILJS_DIAG: unexpected failure', {
    name: error?.name || null,
    message: error?.message || null,
    code: error?.code || null,
    status: error?.status ?? null,
    responseStatus: error?.response?.status ?? null,
    responseText: safe(error?.response?.text || error?.text || null),
    responseData: safe(error?.response?.data || null),
    stack: safe(error?.stack || null),
  });
  process.exitCode = 1;
});
