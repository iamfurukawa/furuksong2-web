import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import { roomService } from '../../services/roomService';
import { healthService, type HealthStatus } from '../../services/healthService';
import type { Category } from '../../types/category';
import type { Room } from '../../types/room';
import './Admin.scss';

const Admin = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [categoriesData, roomsData, healthData] = await Promise.all([
        categoryService.getCategories(),
        roomService.getRooms(),
        healthService.getHealthStatus()
      ]);
      
      setCategories(categoriesData);
      setRooms(roomsData);
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
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    try {
      const newRoom = await roomService.createRoom(newRoomName);
      setRooms(prev => [...prev, newRoom]);
      setNewRoomName('');
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await roomService.deleteRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (err) {
      console.error('Error deleting room:', err);
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
                <span>{category.label}</span>
                <button 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="admin-button danger"
                >
                  Delete
                </button>
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
                <span>{room.name}</span>
                <button 
                  onClick={() => handleDeleteRoom(room.id)}
                  className="admin-button danger"
                >
                  Delete
                </button>
              </div>
            ))}
            {rooms.length === 0 && (
              <div className="empty-state">No rooms found</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Admin;
