import axios from 'axios';
import type { Room, RoomListResponse } from '../types/room';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const roomService = {
  async getRooms(): Promise<Room[]> {
    try {
      const response = await axios.get<RoomListResponse>(`${API_BASE_URL}/rooms`);
      return response.data.rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  }
};
