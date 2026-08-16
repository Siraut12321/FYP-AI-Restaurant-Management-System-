export const normalizePhoneForLookup = (value) => {
  if (!value && value !== 0) return [];

  const raw = String(value).trim();
  const digits = raw.replace(/\D/g, '');
  const candidates = new Set();

  if (raw) candidates.add(raw);
  if (digits) candidates.add(digits);
  if (raw && raw.startsWith('+')) candidates.add(raw.replace(/^\+/, ''));
  if (digits && digits.startsWith('92')) candidates.add(`0${digits.slice(2)}`);

  return [...candidates].filter(Boolean);
};
