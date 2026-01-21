import { useState } from 'react';
import AddSoundModal from './AddSoundModal';
import './SoundGrid.scss';

interface Sound {
  id: string;
  name: string;
  color: string;
  audioUrl?: string;
  categories?: string[];
}

const SoundGrid = ({ searchTerm, selectedCategory }: { searchTerm: string; selectedCategory: string }) => {
  const [sounds, setSounds] = useState<Sound[]>([
    { id: '1', name: 'Sound 1', color: '#ff6b6b', categories: ['memes'] },
    { id: '2', name: 'Sound 2', color: '#4ecdc4', categories: ['gaming'] },
    { id: '3', name: 'Sound 3', color: '#45b7d1', categories: ['music'] },
    { id: '4', name: 'Sound 4', color: '#96ceb4', categories: ['effects'] },
    { id: '5', name: 'Sound 5', color: '#ffeaa7', categories: ['voice'] },
    { id: '6', name: 'Sound 6', color: '#dfe6e9', categories: ['animals'] },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredSounds = sounds.filter(sound => {
    const matchesSearch = sound.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      (sound.categories && sound.categories.includes(selectedCategory));
    return matchesSearch && matchesCategory;
  });

  const handleSoundClick = (sound: Sound) => {
    console.log(`Playing sound: ${sound.name}`);
    // TODO: Implement audio playback
  };

  const handleAddSound = (soundData: { name: string; file: File; categories: string[] }) => {
    console.log('Adding sound:', soundData);
    
    // Criar URL temporária para o arquivo
    const audioUrl = URL.createObjectURL(soundData.file);
    
    // Adicionar novo som à lista
    const newSound: Sound = {
      id: Date.now().toString(),
      name: soundData.name,
      color: '#' + Math.floor(Math.random()*16777215).toString(16), // Cor aleatória
      audioUrl
    };
    
    setSounds(prev => [...prev, newSound]);
  };

  return (
    <div className="sound-grid">
      <div className="sound-grid-container">
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
            style={{ backgroundColor: sound.color }}
            onClick={() => handleSoundClick(sound)}
          >
            <div className="sound-content">
              <span className="sound-name">{sound.name}</span>
              <div className="play-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </button>
        ))}
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
