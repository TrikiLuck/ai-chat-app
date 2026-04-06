import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

const createChatSchema = z.object({
  title: z.string().min(1),
  model: z.string().min(1),
});

const updateChatSchema = z.object({
  title: z.string().min(1),
});

export const getChats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    res.json(chats);
  } catch (error) {
    throw error;
  }
};

export const createChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { title, model } = createChatSchema.parse(req.body);

    const chat = await prisma.chat.create({
      data: {
        title,
        model,
        userId,
      },
    });

    res.status(201).json(chat);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Неверные данные', details: error.errors });
      return;
    }
    throw error;
  }
};

export const getChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const chat = await prisma.chat.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            files: true,
          },
        },
      },
    });

    if (!chat) {
      res.status(404).json({ error: 'Чат не найден' });
      return;
    }

    res.json(chat);
  } catch (error) {
    throw error;
  }
};

export const updateChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { title } = updateChatSchema.parse(req.body);

    const chat = await prisma.chat.findFirst({
      where: { id, userId },
    });

    if (!chat) {
      res.status(404).json({ error: 'Чат не найден' });
      return;
    }

    const updatedChat = await prisma.chat.update({
      where: { id },
      data: { title },
    });

    res.json(updatedChat);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Неверные данные', details: error.errors });
      return;
    }
    throw error;
  }
};

export const deleteChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const chat = await prisma.chat.findFirst({
      where: { id, userId },
    });

    if (!chat) {
      res.status(404).json({ error: 'Чат не найден' });
      return;
    }

    await prisma.chat.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    throw error;
  }
};
