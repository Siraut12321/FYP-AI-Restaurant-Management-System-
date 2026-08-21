import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} from '../controllers/conversation.controller.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(listConversations)
  .post(createConversation);

router.route('/:id')
  .get(getConversation)
  .put(updateConversation)
  .delete(deleteConversation);

export default router;
