import api from './api';
import { File } from '../types';

export const fileService = {
  async uploadFile(file: File): Promise<File> {
    const formData = new FormData();
    formData.append('file', file as any);

    const response = await api.post<File>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getFile(id: string): Promise<Blob> {
    const response = await api.get(`/files/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
