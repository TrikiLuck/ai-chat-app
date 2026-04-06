import api from './api';

export const modelService = {
  async getModels(): Promise<string[]> {
    const response = await api.get<{ models: string[] }>('/models');
    return response.data.models;
  },
};
