import { Router } from 'express';
import { uploadFile, getFile, upload } from '../controllers/fileController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id', getFile);

export default router;
