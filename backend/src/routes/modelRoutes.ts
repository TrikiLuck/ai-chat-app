import { Router } from 'express';
import { getModels } from '../controllers/modelController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getModels);

export default router;
