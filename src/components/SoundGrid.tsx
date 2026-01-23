import { useState } from 'react';
import AddSoundModal from './AddSoundModal';
import { useSounds } from '../hooks/useSounds';
import { useSocket } from '../hooks/useSocketSingleton';
import type { Sound } from '../types/sound';
import './SoundGrid.scss';

const SoundGrid = ({ searchTerm, selectedCategory }: { searchTerm: string; selectedCategory: string }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { sounds, loading, error, createSound, incrementPlayCount } = useSounds();
  const { playSound } = useSocket('ws://localhost:3000', (data) => {
    console.log('Sound played in another tab:', data);
    console.log('Available sounds:', sounds.map(s => ({ id: s.id, name: s.name })));
    console.log('Looking for sound ID:', data.soundId);
    
    // Reproduz o som automaticamente quando tocado em outra guia
    if (data.soundId) {
      const sound = sounds.find(s => s.id === data.soundId);
      console.log('Found sound:', sound ? { id: sound.id, name: sound.name, hasUrl: !!sound.url } : 'NOT FOUND');
      
      if (sound?.url) {
        console.log('Auto-playing sound from another tab:', sound.name);
        const audio = new Audio(sound.url);
        audio.play().catch(error => {
          console.error('Error auto-playing audio:', error);
        });
      } else {
        console.warn('Sound found but no URL available');
      }
    } else {
      console.warn('No soundId provided in sound-played event');
    }
  });

  const filteredSounds = sounds.filter(sound => {
    const matchesSearch = sound.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      sound.categories.some(category => category.id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getSoundColor = (soundId: string) => {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
    const index = parseInt(soundId, 10) % colors.length;
    return colors[index];
  };

  const handleSoundClick = (sound: Sound) => {
    console.log(`Playing sound: ${sound.name}, ID: ${sound.id}`);
    
    incrementPlayCount(sound.id);
    
    // Envia evento WebSocket para tocar som na sala atual
    console.log('Sending play-sound event for sound:', sound.id);
    playSound(sound.id);
    
    if (!sound.url) {
      console.warn('No audio URL available for this sound');
      return;
    }
    
    const audio = new Audio(sound.url);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
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

            {filteredSounds.map((sound) => (
              <button
                key={sound.id}
                className="sound-button"
                style={{ backgroundColor: getSoundColor(sound.id) }}
                onClick={() => handleSoundClick(sound)}
              >
                <div className="sound-content">
                  <span className="sound-name">{sound.name}</span>
                  <div className="play-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  {sound.categories && sound.categories.length > 0 && (
                    <div className="sound-categories">
                      {sound.categories.map((category, index) => (
                        <span key={index} className="category-badge">
                          {category.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="play-count">
                    {sound.playCount} plays
                  </div>
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
