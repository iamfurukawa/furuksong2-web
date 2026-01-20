import { useState } from 'react';
import './Sidebar.scss';

interface Room {
  id: string;
  name: string;
  users: number;
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'offline';
}

const Sidebar = () => {
  const [selectedRoom, setSelectedRoom] = useState('general');
  
  const rooms: Room[] = [
    { id: 'general', name: 'General', users: 12 },
    { id: 'music', name: 'Music', users: 8 },
    { id: 'gaming', name: 'Gaming', users: 15 },
    { id: 'memes', name: 'Memes', users: 6 },
  ];

  const users: User[] = [
    { id: '1', name: 'Simon Busborg', status: 'online' },
    { id: '2', name: 'Kurt Thyboe', status: 'online' },
    { id: '3', name: 'Maria Silva', status: 'idle' },
    { id: '4', name: 'João Santos', status: 'offline' },
  ];

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return '#43b581';
      case 'idle': return '#faa61a';
      case 'offline': return '#747f8d';
      default: return '#747f8d';
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3>Rooms</h3>
        <div className="room-list">
          {rooms.map((room) => (
            <button
              key={room.id}
              className={`room-item ${selectedRoom === room.id ? 'active' : ''}`}
              onClick={() => setSelectedRoom(room.id)}
            >
              <span className="room-name">{room.name}</span>
              <span className="room-users">{room.users}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Online Users</h3>
        <div className="user-list">
          {users.map((user) => (
            <div key={user.id} className="user-item">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(user.status) }}
              />
              <span className="user-name">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
