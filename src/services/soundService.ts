import { request, requestMultipart } from './api';
import type { Sound, SoundListResponse } from '../types/sound';

export const soundService = {
  async getSounds(): Promise<Sound[]> {
    try {
      const response = await request.get<SoundListResponse>('/sounds');
      return response.data.sounds;
    } catch (error) {
      console.error('Error fetching sounds:', error);
      throw error;
    }
  },

  async createSound(formData: FormData): Promise<Sound> {
    try {
      const response = await requestMultipart.post<Sound>('/sound', formData);
      return response.data;
    } catch (error) {
      console.error('Error creating sound:', error);
      throw error;
    }
  },

  async deleteSound(id: string): Promise<void> {
    try {
      await request.delete(`/sound/${id}`);
    } catch (error) {
      console.error('Error deleting sound:', error);
      // Extrair mensagem de erro do Axios se disponível
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error || axiosError.message || 'Failed to delete sound';
        throw new Error(message);
      }
      throw error;
    }
  }
};
