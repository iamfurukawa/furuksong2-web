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
  },

  async createRoom(name: string): Promise<Room> {
    try {
      const response = await axios.post<Room>(`${API_BASE_URL}/room`, { name });
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async deleteRoom(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/room/${id}`);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },
};
