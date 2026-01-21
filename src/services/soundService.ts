import axios from 'axios';
import type { Sound, SoundListResponse } from '../types/sound';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const soundService = {
  async getSounds(): Promise<Sound[]> {
    try {
      const response = await axios.get<SoundListResponse>(`${API_BASE_URL}/sounds`);
      return response.data.sounds;
    } catch (error) {
      console.error('Error fetching sounds:', error);
      throw error;
    }
  },

  async createSound(formData: FormData): Promise<Sound> {
    try {
      const response = await axios.post<Sound>(`${API_BASE_URL}/sound`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating sound:', error);
      throw error;
    }
  },
};
