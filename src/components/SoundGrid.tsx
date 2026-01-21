import { useState } from 'react';
import AddSoundModal from './AddSoundModal';
import './SoundGrid.scss';

interface Sound {
  id: string;
  name: string;
  color: string;
  audioUrl?: string;
  categories?: string[];
  playCount?: number;
}

const SoundGrid = ({ searchTerm, selectedCategory }: { searchTerm: string; selectedCategory: string }) => {
  const [sounds, setSounds] = useState<Sound[]>([
    { id: '1', name: 'Sound 1', color: '#e74c3c', categories: ['memes'], playCount: 0 },
    { id: '2', name: 'Sound 2', color: '#3498db', categories: ['gaming'], playCount: 0 },
    { id: '3', name: 'Sound 3', color: '#2ecc71', categories: ['music'], playCount: 0 },
    { id: '4', name: 'Sound 4', color: '#f39c12', categories: ['effects'], playCount: 0 },
    { id: '5', name: 'Sound 5', color: '#9b59b6', categories: ['voice'], playCount: 0 },
    { id: '6', name: 'Sound 6', color: '#1abc9c', categories: ['animals'], playCount: 0 },
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
    
    // Incrementar contador de reproduções
    setSounds(prevSounds => 
      prevSounds.map(s => 
        s.id === sound.id 
          ? { ...s, playCount: (s.playCount || 0) + 1 }
          : s
      )
    );
    
    // Se não há URL de áudio, não faz nada
    if (!sound.audioUrl) {
      console.warn('No audio URL available for this sound');
      return;
    }
    
    // Criar e reproduzir o áudio
    const audio = new Audio(sound.audioUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
    });
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
              {sound.categories && (
                <div className="sound-categories">
                  {sound.categories.map((category, index) => (
                    <span key={index} className="category-badge">
                      {category}
                    </span>
                  ))}
                </div>
              )}
              <div className="play-count">
                {sound.playCount || 0} plays
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
