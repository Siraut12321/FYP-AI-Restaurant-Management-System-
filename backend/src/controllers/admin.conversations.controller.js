import Conversation from '../models/Conversation.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getAdminConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find()
      .populate('user', 'name email')
      .select('user title status lastMessageAt createdAt updatedAt orderId messages sessionId')
      .sort({ lastMessageAt: -1 })
      .limit(100)
      .lean();

    sendSuccess(res, 200, 'Conversations fetched', { conversations });
  } catch (err) {
    next(err);
  }
};
