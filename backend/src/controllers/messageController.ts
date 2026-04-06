import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { omnirouteService } from '../services/omnirouteService';

const sendMessageSchema = z.object({
  content: z.string().min(1),
  fileIds: z.array(z.string()).optional(),
});

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id: chatId } = req.params;
    const { content, fileIds } = sendMessageSchema.parse(req.body);

    // Проверяем, что чат принадлежит пользователю
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      res.status(404).json({ error: 'Чат не найден' });
      return;
    }

    // Сохраняем сообщение пользователя
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content,
      },
    });

    // Если есть файлы, привязываем их к сообщению
    if (fileIds && fileIds.length > 0) {
      // Получаем информацию о файлах
      const files = await prisma.file.findMany({
        where: { id: { in: fileIds } },
      });

      // Проверяем, есть ли изображения
      const hasImages = files.some((file: { mimeType: string }) => 
        file.mimeType.startsWith('image/')
      );

      if (hasImages) {
        res.status(400).json({ 
          error: 'Модель не поддерживает изображения. Пожалуйста, используйте только текстовые файлы.' 
        });
        return;
      }

      await prisma.file.updateMany({
        where: { id: { in: fileIds } },
        data: { messageId: userMessage.id },
      });
    }

    // Настраиваем SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Формируем историю сообщений для контекста
    const messages = [
      ...chat.messages.map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content },
    ];

    let assistantMessageContent = '';
    let assistantMessageId: string | null = null;

    try {
      // Стримим ответ от Omniroute
      await omnirouteService.streamChat(
        chat.model,
        messages,
        (chunk: string) => {
          assistantMessageContent += chunk;
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        }
      );

      // Сохраняем ответ ассистента в БД
      const assistantMessage = await prisma.message.create({
        data: {
          chatId,
          role: 'assistant',
          content: assistantMessageContent,
        },
      });

      assistantMessageId = assistantMessage.id;

      // Обновляем время последнего обновления чата
      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      // Отправляем финальное событие
      res.write(
        `data: ${JSON.stringify({
          type: 'done',
          messageId: assistantMessageId,
        })}\n\n`
      );
    } catch (error) {
      console.error('Ошибка при стриминге:', error);
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          error: 'Ошибка при получении ответа от модели',
        })}\n\n`
      );
    }

    res.end();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Неверные данные', details: error.errors });
      return;
    }
    throw error;
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id: chatId } = req.params;

    // Проверяем, что чат принадлежит пользователю
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      res.status(404).json({ error: 'Чат не найден' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: {
        files: true,
      },
    });

    res.json(messages);
  } catch (error) {
    throw error;
  }
};
