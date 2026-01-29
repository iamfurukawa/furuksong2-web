import { request } from './api';
import type { Room, RoomListResponse } from '../types/room';

export const roomService = {
  async getRooms(): Promise<Room[]> {
    try {
      const response = await request.get<RoomListResponse>('/rooms');
      return response.data.rooms;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  async createRoom(name: string): Promise<Room> {
    try {
      const response = await request.post<Room>('/room', { name });
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async deleteRoom(id: string): Promise<void> {
    try {
      await request.delete(`/room/${id}`);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },

  async updateRoom(id: string, name: string): Promise<Room> {
    try {
      const response = await request.put<Room>(`/room/${id}`, { name });
      return response.data;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }
};
