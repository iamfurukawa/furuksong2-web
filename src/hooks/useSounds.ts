import { useState, useEffect } from 'react';
import { soundService } from '../services/soundService';
import type { Sound } from '../types/sound';

export const useSounds = () => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSounds = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await soundService.getSounds();
      setSounds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sounds');
    } finally {
      setLoading(false);
    }
  };

  const createSound = async (formData: FormData) => {
    try {
      const newSound = await soundService.createSound(formData);
      setSounds(prev => [...prev, newSound]);
      return newSound;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create sound';
      setError(errorMessage);
      throw err;
    }
  };

  const incrementPlayCount = (soundId: string) => {
    setSounds(prevSounds => 
      prevSounds.map(s => 
        s.id === soundId 
          ? { ...s, playCount: s.playCount + 1 }
          : s
      )
    );
  };

  useEffect(() => {
    fetchSounds();
  }, []);

  return {
    sounds,
    loading,
    error,
    refetch: fetchSounds,
    createSound,
    incrementPlayCount,
  };
};
