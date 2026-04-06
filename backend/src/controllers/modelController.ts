import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { omnirouteService } from '../services/omnirouteService';

export const getModels = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const models = await omnirouteService.getAvailableModels();
    res.json({ models });
  } catch (error) {
    throw error;
  }
};
