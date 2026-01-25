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
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { categories, loading, error } = useCategories();

  const getSoundColor = (index: number) => {
    // Usa HSL para criar cores sequenciais em tons pasteis
    const hue = (index * 137.5) % 360; // 137.5° é ângulo dourado para melhor distribuição
    return `hsl(${hue}, 55%, 60%)`;
  };

  const filteredCategories = (categories || []).filter(category =>
    category.label.toLowerCase().includes(categorySearchTerm.toLowerCase()) &&
    !selectedCategories.includes(category.id)
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de arquivo .mp3
      if (file.type !== 'audio/mpeg' && !file.name.toLowerCase().endsWith('.mp3')) {
        alert('Por favor, selecione um arquivo MP3 válido.');
        e.target.value = ''; // Limpa o input
        return;
      }
      
      // Validação de tamanho (1MB = 1048576 bytes)
      if (file.size > 1048576) {
        alert('O arquivo deve ter no máximo 1MB.');
        e.target.value = ''; // Limpa o input
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
    return getSoundColor(index);
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
            accept=".mp3,audio/mpeg"
            required
          />
          <small className="form-hint">Format: MP3 (max 1MB)</small>
        </div>

        <div className="form-group">
          <label>Categories</label>
          <div className="category-selector">
            <div className="category-input-wrapper">
              <input
                type="text"
                value={categorySearchTerm}
                onChange={(e) => setCategorySearchTerm(e.target.value)}
                onFocus={() => setShowCategoryDropdown(true)}
                placeholder="Type to search categories..."
                className="category-search-input"
              />
              {showCategoryDropdown && (
                <button
                  type="button"
                  className="category-clear-button"
                  onClick={() => {
                    setCategorySearchTerm('');
                    setShowCategoryDropdown(false);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
            
            {showCategoryDropdown && (
              <div className="category-dropdown">
                {loading ? (
                  <div className="loading-categories">Loading categories...</div>
                ) : error ? (
                  <div className="error-categories">Error loading categories</div>
                ) : filteredCategories.length === 0 ? (
                  <div className="no-categories">No categories found</div>
                ) : (
                  filteredCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className="category-item"
                      onClick={() => {
                        toggleCategory(category.id);
                        setCategorySearchTerm('');
                      }}
                    >
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(category.id) }}
                      >
                        {category.label}
                      </span>
                    </div>
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
