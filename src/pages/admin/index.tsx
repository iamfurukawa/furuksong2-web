import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { roomService } from '../../services/roomService';
import { soundService } from '../../services/soundService';
import { healthService, type HealthStatus } from '../../services/healthService';
import type { Category } from '../../types/category';
import type { Room } from '../../types/room';
import type { Sound } from '../../types/sound';
import './Admin.scss';

const Admin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  
  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, roomsData, soundsData, healthData] = await Promise.all([
        categoryService.getCategories(),
        roomService.getRooms(),
        soundService.getSounds(),
        healthService.getHealthStatus()
      ]);
      
      setCategories(categoriesData);
      setRooms(roomsData);
      setSounds(soundsData);
      setHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      const newCategory = await categoryService.createCategory(newCategoryName);
      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
    } catch (err) {
      console.error('Error creating category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const newRoom = await roomService.createRoom(newRoomName.trim());
      setRooms(prev => [...prev, newRoom]);
      setNewRoomName('');
    } catch (err) {
      console.error('Error creating room:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEditCategory = (id: string, currentName: string) => {
    setEditingCategoryId(id);
    setEditingCategoryName(currentName);
  };

  const handleSaveEdit = async () => {
    if (!editingCategoryId || !editingCategoryName.trim()) {
      return;
    }
    
    try {
      const updatedCategory = await categoryService.updateCategory(editingCategoryId, editingCategoryName.trim());
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategoryId ? updatedCategory : cat
      ));
      setEditingCategoryId(null);
      setEditingCategoryName('');
    } catch (err) {
      console.error('Error updating category:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update category';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }
    
    try {
      await roomService.deleteRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (err) {
      console.error('Error deleting room:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEditRoom = (id: string, currentName: string) => {
    setEditingRoomId(id);
    setEditingRoomName(currentName);
  };

  const handleSaveRoomEdit = async () => {
    if (!editingRoomId || !editingRoomName.trim()) {
      return;
    }
    
    try {
      const updatedRoom = await roomService.updateRoom(editingRoomId, editingRoomName.trim());
      setRooms(prev => prev.map(room => 
        room.id === editingRoomId ? updatedRoom : room
      ));
      setEditingRoomId(null);
      setEditingRoomName('');
    } catch (err) {
      console.error('Error updating room:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update room';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancelRoomEdit = () => {
    setEditingRoomId(null);
    setEditingRoomName('');
  };

  const handleDeleteSound = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sound?')) {
      return;
    }
    
    try {
      await soundService.deleteSound(id);
      setSounds(prev => prev.filter(sound => sound.id !== id));
    } catch (err) {
      console.error('Error deleting sound:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete sound';
      alert(`Error: ${errorMessage}`);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
      case 'unhealthy':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading admin data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      
      {/* System Health and Socket Events */}
      <div className="admin-row">
        <section className="admin-section">
          <h2>System Health</h2>
          {health && (
            <div className="health-card">
              <div className="health-item">
                <span className="health-label">Status:</span>
                <span 
                  className="health-value" 
                  style={{ color: getHealthColor(health.status) }}
                >
                  {health.status.toUpperCase()}
                </span>
              </div>
              <div className="health-item">
                <span className="health-label">Timestamp:</span>
                <span className="health-value">
                  {new Date(health.timestamp).toLocaleString()}
                </span>
              </div>
              {health.uptime && (
                <div className="health-item">
                  <span className="health-label">Uptime:</span>
                  <span className="health-value">
                    {Math.floor(health.uptime / 60)}m {health.uptime % 60}s
                  </span>
                </div>
              )}
              {health.version && (
                <div className="health-item">
                  <span className="health-label">Version:</span>
                  <span className="health-value">{health.version}</span>
                </div>
              )}
              {health.database && (
                <div className="health-item">
                  <span className="health-label">Database:</span>
                  <span 
                    className="health-value" 
                    style={{ color: getHealthColor(health.database.status) }}
                  >
                    {health.database.status} ({health.database.connected ? 'Connected' : 'Disconnected'})
                  </span>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Categories and Rooms */}
      <div className="admin-row admin-row-scroll">
        <section className="admin-section">
          <h2>Categories</h2>
          
          <form onSubmit={handleCreateCategory} className="admin-form">
            <input
              type="text"
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="admin-input"
            />
            <button type="submit" className="admin-button primary">
              Add Category
            </button>
          </form>

          <div className="admin-list">
            {categories.map((category) => (
              <div key={category.id} className="admin-list-item">
                {editingCategoryId === category.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="admin-input"
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button 
                        onClick={handleSaveEdit}
                        className="admin-button primary"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        className="admin-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span>{category.label}</span>
                    <div className="action-buttons" style={{ gap: '2rem' }}>
                      <button 
                        onClick={() => handleEditCategory(category.id, category.label)}
                        className="admin-button secondary"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="admin-button danger"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {categories.length === 0 && (
              <div className="empty-state">No categories found</div>
            )}
          </div>
        </section>

        <section className="admin-section">
          <h2>Rooms</h2>
          
          <form onSubmit={handleCreateRoom} className="admin-form">
            <input
              type="text"
              placeholder="New room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="admin-input"
            />
            <button type="submit" className="admin-button primary">
              Add Room
            </button>
          </form>

          <div className="admin-list">
            {rooms.map((room) => (
              <div key={room.id} className="admin-list-item">
                {editingRoomId === room.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      value={editingRoomName}
                      onChange={(e) => setEditingRoomName(e.target.value)}
                      className="admin-input"
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button 
                        onClick={handleSaveRoomEdit}
                        className="admin-button primary"
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelRoomEdit}
                        className="admin-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span>{room.name}</span>
                    <div className="action-buttons" style={{ gap: '2rem' }}>
                      <button 
                        onClick={() => handleEditRoom(room.id, room.name)}
                        className="admin-button secondary"
                        style={{ marginRight: '0.5rem' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteRoom(room.id)}
                        className="admin-button danger"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {rooms.length === 0 && (
              <div className="empty-state">No rooms found</div>
            )}
          </div>
        </section>
      </div>

      {/* Sounds */}
      <section className="admin-section">
        <h2>Sounds</h2>
        
        <div className="admin-list">
          {sounds.map((sound) => (
            <div key={sound.id} className="admin-list-item">
              <div className="sound-info">
                <span className="sound-name">{sound.name}</span>
                <span className="sound-categories">
                  {sound.categories && sound.categories.length > 0 
                    ? sound.categories.map(cat => cat.label).join(', ')
                    : 'No categories'
                  }
                </span>
              </div>
              <button 
                onClick={() => handleDeleteSound(sound.id)}
                className="admin-button danger"
              >
                Delete
              </button>
            </div>
          ))}
          {sounds.length === 0 && (
            <div className="empty-state">No sounds found</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Admin;
