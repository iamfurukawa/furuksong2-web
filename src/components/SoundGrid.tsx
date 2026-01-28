import { useState, useRef, useEffect } from 'react';
import AddSoundModal from './AddSoundModal';
import { useSounds } from '../hooks/useSounds';
import { useSocket } from '../hooks/useSocket';
import { useVolumeContext } from '../contexts/VolumeContext';
import type { Sound } from '../types/sound';
import './SoundGrid.scss';

const SoundGrid = ({ searchTerm, selectedCategory }: { searchTerm: string; selectedCategory: string }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { sounds, loading, error, createSound } = useSounds();
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const { volume, isMuted } = useVolumeContext();
  
  // Atualizar volume do áudio atual quando o volume mudar
  useEffect(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  const { playSound } = useSocket((data) => {
    // Reproduz o som automaticamente quando tocado em outra guia
    if (data.soundId) {
      const sound = sounds.find(s => s.id === data.soundId);
      
      if (sound?.url) {
        // Verificar se o mesmo som já está tocando
        if (currentAudioRef.current && currentAudioRef.current.src === sound.url) {
          // Parar o som se já estiver tocando
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
          currentAudioRef.current = null;
          return;
        }
        
        // Pausar qualquer som que esteja tocando
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
        }
        
        console.log('Playing Audio:', sound.name);
        const audio = new Audio(sound.url);
        audio.volume = isMuted ? 0 : volume; // Aplicar volume global
        currentAudioRef.current = audio;
        
        audio.play().catch(error => {
          console.error('Error auto-playing audio:', error);
        });
        
        // Limpar referência quando o som terminar
        audio.addEventListener('ended', () => {
          currentAudioRef.current = null;
        });
      }
    }
  });

  const filteredSounds = (sounds || []).filter(sound => {
    const matchesSearch = sound.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      sound.categories.some(category => category.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getSoundColor = (index: number) => {
    // Usa HSL para criar cores sequenciais em tons pasteis
    const hue = (index * 137.5) % 360; // 137.5° é ângulo dourado para melhor distribuição
    return `hsl(${hue}, 55%, 60%)`; // Saturação 50% e Luminosidade 85% para tons pasteis
  };

  const handleSoundClick = (sound: Sound) => {
    console.log('Sending play-sound event for sound:', sound.id);
    playSound(sound.id);
  };

  const handleAddSound = async (soundData: { name: string; file: File; categories: string[] }) => {
    try {
      const formData = new FormData();
      formData.append('name', soundData.name);
      formData.append('file', soundData.file);
      soundData.categories.forEach(categoryId => {
        formData.append('categories', categoryId);
      });

      await createSound(formData);
    } catch (error) {
      console.error('Error adding sound:', error);
    }
  };

  // Função para capitalizar a primeira letra de cada palavra
  const capitalizeText = (text: string) => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="sound-grid">
      <div className="sound-grid-container">
        {loading ? (
          <div className="loading-sounds">Loading sounds...</div>
        ) : error ? (
          <div className="error-sounds">Error loading sounds: {error}</div>
        ) : (
          <>
            <button className="sound-button add-sound-button" onClick={() => setIsAddModalOpen(true)}>
              <div className="sound-content">
                <span className="sound-name">Add new sound...</span>
                <div className="add-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#666">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
                  </svg>
                </div>
              </div>
            </button>

            {filteredSounds.map((sound, index) => (
              <button
                key={sound.id}
                className="sound-button"
                style={{ backgroundColor: getSoundColor(index) }}
                onClick={() => handleSoundClick(sound)}
              >
                <div className="sound-content">
                  <span className="sound-name">{capitalizeText(sound.name)}</span>
                  <div className="play-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  {sound.categories && sound.categories.length > 0 && (
                    <div className="sound-categories">
                      {sound.categories.map((category, index) => (
                        <span key={index} className="category-badge">
                          {capitalizeText(category.label)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </>
        )}
      </div>

      <AddSoundModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSound={handleAddSound}
      />
    </div>
  );
};

export default SoundGrid;
