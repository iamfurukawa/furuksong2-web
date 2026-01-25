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
  }
};
