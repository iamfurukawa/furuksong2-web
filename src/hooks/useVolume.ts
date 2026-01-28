import { useState, useEffect, useCallback } from 'react';

export const useVolume = () => {
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('furukawa-volume');
    return savedVolume ? parseFloat(savedVolume) : 0.5;
  });

  useEffect(() => {
    localStorage.setItem('furukawa-volume', volume.toString());
  }, [volume]);

  const updateVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  }, []);

  // Aplicar volume a todos os elementos de áudio quando o volume mudar
  useEffect(() => {
    const applyVolumeToAllAudio = () => {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => {
        audio.volume = volume;
      });
    };

    applyVolumeToAllAudio();
    
    // Também observar novos áudios que possam ser criados
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'AUDIO') {
            (node as HTMLAudioElement).volume = volume;
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, [volume]);

  const increaseVolume = useCallback(() => {
    updateVolume(volume + 0.1);
  }, [volume, updateVolume]);

  const decreaseVolume = useCallback(() => {
    updateVolume(volume - 0.1);
  }, [volume, updateVolume]);

  const toggleMute = useCallback(() => {
    updateVolume(volume === 0 ? 0.5 : 0);
  }, [volume, updateVolume]);

  return {
    volume,
    setVolume: updateVolume,
    increaseVolume,
    decreaseVolume,
    toggleMute,
    isMuted: volume === 0
  };
};
