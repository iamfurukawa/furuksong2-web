import type { User } from '../hooks/useAuth';
import './Header.scss';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Header = ({ user, onLogout, searchTerm, onSearchChange }: HeaderProps) => {
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
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="header-right">
        {user && (
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <button onClick={onLogout} className="logout-button">
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
