import { useState, useEffect } from 'react';
import { roomService } from '../services/roomService';
import type { Room } from '../types/room';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (name: string) => {
    try {
      const newRoom = await roomService.createRoom(name);
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await roomService.deleteRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    createRoom,
    deleteRoom,
  };
};
