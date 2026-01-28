import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { VolumeProvider } from './contexts/VolumeContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/login';
import Home from './pages/home';
import './App.scss';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  return (
    <VolumeProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Login />} 
          />
          <Route 
            path="/" 
            element={user ? <Home /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </VolumeProvider>
  );
}

export default App;
