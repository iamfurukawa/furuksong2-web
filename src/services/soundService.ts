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
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error || axiosError.message || 'Failed to delete sound';
        throw new Error(message);
      }
      throw error;
    }
  },

  async updateSound(id: string, name: string, categoryIds: string[]): Promise<Sound> {
    try {
      const response = await request.put<Sound>(`/sound/${id}`, { name, categoryIds });
      return response.data;
    } catch (error) {
      console.error('Error updating sound:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const message = axiosError.response?.data?.error || axiosError.message || 'Failed to update sound';
        throw new Error(message);
      }
      throw error;
    }
  }
};
