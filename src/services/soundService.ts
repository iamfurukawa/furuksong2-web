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
  }
};
