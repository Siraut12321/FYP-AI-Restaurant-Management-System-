import axios from 'axios';

const AI_WEBHOOK_URL = 'https://siraut.app.n8n.cloud/webhook/restaurant-ai';
const SESSION_KEY = 'restaurant_ai_session_id';
const MESSAGES_KEY = 'restaurant_ai_messages';

const getOrCreateSessionId = () => {
  if (typeof window === 'undefined') return null;
  let sessionId = window.localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;
    window.localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const loadPersistedMessages = () => {
  try {
    const raw = window.localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const persistMessages = (messages) => {
  try {
    window.localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // ignore storage errors
  }
};

export const clearPersistedConversation = () => {
  try {
    window.localStorage.removeItem(MESSAGES_KEY);
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem('va_welcome_played');
  } catch {
    // ignore
  }
};

export const sendMessageToAI = async (message, language = 'en', metadata = {}) => {
  const trimmedMessage = message?.trim();
  const selectedLanguage = language === 'ur' ? 'ur' : 'en';

  if (!trimmedMessage) {
    throw new Error('Message is required');
  }

  const sessionId = getOrCreateSessionId();
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

  try {
    const response = await axios.post(
      AI_WEBHOOK_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('AI webhook request failed:', error);
    throw error;
  }
};
