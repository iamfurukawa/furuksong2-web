import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { User } from '../hooks/useAuth';
import './Header.scss';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const Header = ({ user, onLogout, searchTerm, onSearchChange, selectedCategory, onCategoryChange }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(searchTerm);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'memes', label: 'Memes' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'music', label: 'Music' },
    { value: 'effects', label: 'Effects' },
    { value: 'voice', label: 'Voice' },
    { value: 'animals', label: 'Animals' }
  ];

  return (
    <header className="header">
      <div className="header-left">
        <h1>Furuksong2</h1>
      </div>
      
      <div className="header-center">
        <div className="search-container">
          <input
            type="text"
            placeholder="Pesquisar sons..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange(e.target.value);
            }}
            className="search-input"
          />
          <select
            className="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="header-right">
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <button onClick={() => {
              onLogout();
              window.location.href = '/login';
            }} className="logout-button">
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
