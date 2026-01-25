import { useState, useRef } from 'react';
import Modal from './Modal';
import { useCategories } from '../hooks/useCategories';
import './AddSoundModal.scss';

interface AddSoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSound: (soundData: {
    name: string;
    file: File;
    categories: string[];
  }) => void;
}

const AddSoundModal = ({ isOpen, onClose, onAddSound }: AddSoundModalProps) => {
  const [name, setName] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { categories, loading, error } = useCategories();

  const categoryColors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
    '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe',
    '#6c5ce7', '#00b894', '#00cec9', '#0984e3'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação simples de arquivo de áudio
      if (!file.type.startsWith('audio/')) {
        alert('Por favor, selecione um arquivo de áudio válido.');
        return;
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const file = fileInputRef.current?.files?.[0];
    if (!name.trim()) {
      alert('Por favor, digite um nome para o som.');
      return;
    }
    
    if (!file) {
      alert('Por favor, selecione um arquivo de áudio.');
      return;
    }

    if (selectedCategories.length === 0) {
      alert('Por favor, selecione pelo menos uma categoria.');
      return;
    }

    onAddSound({
      name: name.trim(),
      file,
      categories: selectedCategories
    });

    // Reset form
    setName('');
    setSelectedCategories([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.label || '';
  };

  const getCategoryColor = (categoryId: string) => {
    const index = categories.findIndex(cat => cat.id === categoryId);
    return categoryColors[index % categoryColors.length];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Sound">
      <form onSubmit={handleSubmit} className="add-sound-form">
        <div className="form-group">
          <label htmlFor="sound-name">Sound Name</label>
          <input
            id="sound-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter sound name..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sound-file">Audio File</label>
          <input
            id="sound-file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="audio/*"
            required
          />
          <small className="form-hint">Supported formats: MP3, WAV, OGG, M4A</small>
        </div>

        <div className="form-group">
          <label>Categories</label>
          <div className="category-selector">
            <button
              type="button"
              className="category-dropdown-button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span>Select Categories</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
            
            {showCategoryDropdown && (
              <div className="category-dropdown">
                {loading ? (
                  <div className="loading-categories">Loading categories...</div>
                ) : error ? (
                  <div className="error-categories">Error loading categories</div>
                ) : (
                  (categories || []).map((category) => (
                    <label key={category.id} className="category-item">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                      />
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(category.id) }}
                      >
                        {category.label}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
          
          {selectedCategories.length > 0 && (
            <div className="selected-categories">
              {selectedCategories.map((categoryId) => (
                <span 
                  key={categoryId}
                  className="selected-category-badge"
                  style={{ backgroundColor: getCategoryColor(categoryId) }}
                >
                  {getCategoryName(categoryId)}
                  <button
                    type="button"
                    onClick={() => toggleCategory(categoryId)}
                    className="remove-category"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add Sound
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSoundModal;
