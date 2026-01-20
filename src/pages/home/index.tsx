import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../../components/Sidebar';
import SoundGrid from '../../components/SoundGrid';
import Header from '../../components/Header';
import './index.scss';

const Home = () => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="home-container">
      <Header 
        user={user} 
        onLogout={logout} 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="home-content">
        <Sidebar />
        <main className="main-content">
          <SoundGrid searchTerm={searchTerm} />
        </main>
      </div>
    </div>
  );
};

export default Home;
