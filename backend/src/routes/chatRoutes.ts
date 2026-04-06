import { Router } from 'express';
import {
  getChats,
  createChat,
  getChat,
  updateChat,
  deleteChat,
} from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getChats);
router.post('/', createChat);
router.get('/:id', getChat);
router.patch('/:id', updateChat);
router.delete('/:id', deleteChat);

export default router;
