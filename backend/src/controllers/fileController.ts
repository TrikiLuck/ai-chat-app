import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Настройка хранилища для multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Файл не предоставлен' });
      return;
    }

    const file = await prisma.file.create({
      data: {
        filename: req.file.originalname,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
        messageId: '', // Будет обновлено при отправке сообщения
      },
    });

    res.status(201).json(file);
  } catch (error) {
    throw error;
  }
};

export const getFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        message: {
          include: {
            chat: true,
          },
        },
      },
    });

    if (!file) {
      res.status(404).json({ error: 'Файл не найден' });
      return;
    }

    // Проверяем, что пользователь имеет доступ к файлу
    if (file.message.chat.userId !== req.userId) {
      res.status(403).json({ error: 'Доступ запрещен' });
      return;
    }

    res.download(file.path, file.filename);
  } catch (error) {
    throw error;
  }
};
