import axios from 'axios';

const AI_WEBHOOK_URL = 'https://siraut.app.n8n.cloud/webhook/restaurant-ai';

// ─── Per-conversation localStorage helpers ────────────────────────────────────
// Storage format:
//   conversations_index  → JSON array of { id, sessionId, title, updatedAt }
//   conv_messages_{id}   → JSON array of messages
//   active_conv_id       → currently active conversation id

const INDEX_KEY  = 'conversations_index';
const ACTIVE_KEY = 'active_conv_id';

const convMessagesKey = (id) => `conv_messages_${id}`;

export const generateSessionId = () =>
  `session_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;

export const generateConvId = () =>
  `conv_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;

// ─── Index helpers ─────────────────────────────────────────────────────────────
export const loadConversationIndex = () => {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveConversationIndex = (index) => {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(index)); } catch { /* ignore */ }
};

// ─── Active conversation ───────────────────────────────────────────────────────
export const getActiveConvId = () => localStorage.getItem(ACTIVE_KEY) || null;

export const setActiveConvId = (id) => {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
};

// ─── Messages per conversation ─────────────────────────────────────────────────
export const loadConvMessages = (convId) => {
  try {
    const raw = localStorage.getItem(convMessagesKey(convId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

export const saveConvMessages = (convId, messages) => {
  try {
    localStorage.setItem(convMessagesKey(convId), JSON.stringify(messages));
    // Update updatedAt in index
    const index = loadConversationIndex();
    const entry = index.find((c) => c.id === convId);
    if (entry) {
      entry.updatedAt = new Date().toISOString();
      saveConversationIndex(index);
    }
  } catch { /* ignore */ }
};

// ─── Create a new guest conversation ──────────────────────────────────────────
export const createGuestConversation = () => {
  const id        = generateConvId();
  const sessionId = generateSessionId();
  return { id, sessionId, title: 'New Conversation', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
};

export const persistGuestConversation = (conversation) => {
  if (!conversation?.id) return;
  const index = loadConversationIndex();
  if (!index.some((entry) => entry.id === conversation.id)) {
    index.unshift(conversation);
    saveConversationIndex(index);
  }
  setActiveConvId(conversation.id);
};

// ─── Update title in guest index ──────────────────────────────────────────────
export const updateGuestConvTitle = (convId, title) => {
  const index = loadConversationIndex();
  const entry = index.find((c) => c.id === convId);
  if (entry) {
    const cleaned = String(title || '')
      .trim()
      .replace(/^(hi|hello|hey|assalamu alaikum|salam)[,\.\s]*/i, '')
      .replace(/^(what|where|which|how|can|could|please)\s+/i, '')
      .trim();
    const lowerTitle = cleaned.toLowerCase();
    const generatedTitle = lowerTitle.includes('pizza') || lowerTitle.includes('menu')
      ? 'Pizza Menu'
      : lowerTitle.includes('drink') || lowerTitle.includes('beverage')
        ? 'Drinks'
        : lowerTitle.includes('dessert') || lowerTitle.includes('sweet')
          ? 'Drinks & Desserts'
          : lowerTitle.includes('order') || lowerTitle.includes('buy')
            ? 'Order Inquiry'
            : cleaned;
    entry.title = generatedTitle ? generatedTitle.slice(0, 60) : 'Restaurant Question';
    saveConversationIndex(index);
  }
};

// ─── Delete a guest conversation ──────────────────────────────────────────────
export const deleteGuestConversation = (convId) => {
  const index = loadConversationIndex().filter((c) => c.id !== convId);
  saveConversationIndex(index);
  try { localStorage.removeItem(convMessagesKey(convId)); } catch { /* ignore */ }
  if (getActiveConvId() === convId) setActiveConvId(null);
};

// ─── Get sessionId for a guest conversation ───────────────────────────────────
export const getGuestSessionId = (convId) => {
  const index = loadConversationIndex();
  return index.find((c) => c.id === convId)?.sessionId || null;
};

// ─── Clear all guest conversations (on login/logout) ──────────────────────────
export const clearAllGuestConversations = () => {
  try {
    const index = loadConversationIndex();
    index.forEach((c) => { try { localStorage.removeItem(convMessagesKey(c.id)); } catch { /* ignore */ } });
    localStorage.removeItem(INDEX_KEY);
    localStorage.removeItem(ACTIVE_KEY);
    // Legacy keys
    localStorage.removeItem('restaurant_ai_messages');
    localStorage.removeItem('restaurant_ai_session_id');
    sessionStorage.removeItem('va_welcome_played');
  } catch { /* ignore */ }
};

// ─── Legacy single-conversation helpers (kept for backward compat) ─────────────
export const loadPersistedMessages = () => {
  const activeId = getActiveConvId();
  if (activeId) return loadConvMessages(activeId);
  try {
    const raw = localStorage.getItem('restaurant_ai_messages');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const persistMessages = (messages, convId) => {
  const id = convId || getActiveConvId();
  if (id) { saveConvMessages(id, messages); return; }
  try { localStorage.setItem('restaurant_ai_messages', JSON.stringify(messages)); } catch { /* ignore */ }
};

export const clearPersistedConversation = () => {
  try {
    localStorage.removeItem('restaurant_ai_messages');
    localStorage.removeItem('restaurant_ai_session_id');
    sessionStorage.removeItem('va_welcome_played');
  } catch { /* ignore */ }
};

// ─── Send message to AI ────────────────────────────────────────────────────────
export const sendMessageToAI = async (message, language = 'en', metadata = {}) => {
  const trimmedMessage = message?.trim();
  if (!trimmedMessage) throw new Error('Message is required');

  const selectedLanguage = language === 'ur' ? 'ur' : 'en';
  const sessionId = metadata.sessionId || generateSessionId();

  const payload = {
    message: trimmedMessage,
    language: selectedLanguage,
    authenticated: metadata.authenticated === true,
    userId: metadata.userId || null,
    userName: metadata.userName || null,
    phone: metadata.phone || null,
    address: metadata.address || null,
    city: metadata.city || null,
    sessionId,
  };

  const response = await axios.post(AI_WEBHOOK_URL, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  return response.data;
};
