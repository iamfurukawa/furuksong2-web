import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface VolumeContextType {
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const VolumeContext = createContext<VolumeContextType | undefined>(undefined);

export const useVolumeContext = () => {
  const context = useContext(VolumeContext);
  if (!context) {
    throw new Error('useVolumeContext must be used within a VolumeProvider');
  }
  return context;
};

interface VolumeProviderProps {
  children: ReactNode;
}

export const VolumeProvider: React.FC<VolumeProviderProps> = ({ children }) => {
  const [volume, setVolumeState] = useState(() => {
    const savedVolume = localStorage.getItem('furukawa-volume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    localStorage.setItem('furukawa-volume', volume.toString());
    
    // Aplicar volume a todos os áudios existentes
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.volume = isMuted ? 0 : volume;
    });
  }, [volume, isMuted]);

  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (clampedVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <VolumeContext.Provider value={{ volume, setVolume, isMuted, toggleMute }}>
      {children}
    </VolumeContext.Provider>
  );
};
