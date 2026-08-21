import Conversation from '../models/Conversation.js';
import AppError from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';

// Derive a short title from the first user message
function deriveTitle(firstMessage = '') {
  const text = firstMessage.trim().slice(0, 120);
  if (!text) return 'New Conversation';

  // Strip common filler words and capitalise
  const cleaned = text
    .replace(/^(hi|hello|hey|assalamu alaikum|salam|السلام علیکم)[,.\s]*/i, '')
    .replace(/^(i want|i'd like|can i get|give me|show me|mujhe|mujhy)[,.\s]*/i, '')
    .trim();

  const title = (cleaned || text).slice(0, 60);
  return title.charAt(0).toUpperCase() + title.slice(1);
}

// GET /api/v1/conversations
export const listConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .select('title status lastMessageAt createdAt orderId sessionId')
      .sort({ lastMessageAt: -1 })
      .limit(50)
      .lean();
    sendSuccess(res, 200, 'Conversations fetched', { conversations });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/conversations/:id
export const getConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!conv) return next(new AppError('Conversation not found.', 404));
    sendSuccess(res, 200, 'Conversation fetched', { conversation: conv });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/conversations
export const createConversation = async (req, res, next) => {
  try {
    const { sessionId, title } = req.body;
    if (!sessionId) return next(new AppError('sessionId is required.', 400));

    const existing = await Conversation.findOne({ sessionId });
    if (existing) {
      if (existing.user.toString() !== req.user._id.toString()) {
        return next(new AppError('Session ID conflict.', 409));
      }
      return sendSuccess(res, 200, 'Conversation already exists', { conversation: existing });
    }

    const conv = await Conversation.create({
      user: req.user._id,
      sessionId,
      title: title || 'New Conversation',
    });
    sendSuccess(res, 201, 'Conversation created', { conversation: conv });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/conversations/:id
export const updateConversation = async (req, res, next) => {
  try {
    const { messages, title, status, orderId } = req.body;

    const conv = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!conv) return next(new AppError('Conversation not found.', 404));

    if (Array.isArray(messages)) {
      conv.messages = messages;
      conv.lastMessageAt = new Date();

      // Auto-title from first user message if still default
      if (conv.title === 'New Conversation') {
        const firstUser = messages.find((m) => m.role === 'user');
        if (firstUser) conv.title = deriveTitle(firstUser.content);
      }
    }
    if (title !== undefined) conv.title = title.slice(0, 80);
    if (status !== undefined) conv.status = status;
    if (orderId !== undefined) conv.orderId = orderId;

    await conv.save();
    sendSuccess(res, 200, 'Conversation updated', { conversation: conv });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/conversations/:id
export const deleteConversation = async (req, res, next) => {
  try {
    const conv = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!conv) return next(new AppError('Conversation not found.', 404));
    sendSuccess(res, 200, 'Conversation deleted', {});
  } catch (err) {
    next(err);
  }
};
