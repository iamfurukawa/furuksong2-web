import { useState } from 'react';
import './Sidebar.scss';

interface Room {
  id: string;
  name: string;
  users: User[];
}

interface User {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'offline';
}

const Sidebar = () => {
  const [selectedRoom, setSelectedRoom] = useState('general');
  
  const rooms: Room[] = [
    { 
      id: 'general', 
      name: 'General', 
      users: [
        { id: '1', name: 'Simon Busborg', status: 'online' },
        { id: '2', name: 'Kurt Thyboe', status: 'online' },
        { id: '3', name: 'Maria Silva', status: 'idle' }
      ]
    },
    { 
      id: 'music', 
      name: 'Music', 
      users: [
        { id: '4', name: 'João Santos', status: 'online' },
        { id: '5', name: 'Ana Costa', status: 'online' }
      ]
    },
    { 
      id: 'gaming', 
      name: 'Gaming', 
      users: [
        { id: '6', name: 'Pedro Lima', status: 'offline' },
        { id: '7', name: 'Lucas Souza', status: 'idle' }
      ]
    },
    { 
      id: 'memes', 
      name: 'Memes', 
      users: [
        { id: '8', name: 'Carla Dias', status: 'online' }
      ]
    },
  ];

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return '#43b581';
      case 'idle': return '#faa61a';
      case 'offline': return '#747f8d';
      default: return '#747f8d';
    }
  };

  const getAllOnlineUsers = () => {
    const allOnlineUsers: (User & { roomName: string })[] = [];
    
    rooms.forEach((room) => {
      room.users.forEach((user) => {
        if (user.status === 'online') {
          allOnlineUsers.push({
            ...user,
            roomName: room.name
          });
        }
      });
    });
    
    return allOnlineUsers;
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
              <span className="room-users">{room.users.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Room Users</h3>
        <div className="user-list">
          {rooms
            .find((room) => room.id === selectedRoom)
            ?.users.map((user) => (
              <div key={user.id} className="user-item">
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(user.status) }}
                />
                <span className="user-name">{user.name}</span>
              </div>
            )) || <div className="no-users">No users in this room</div>}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Who's Online</h3>
        <div className="user-list">
          {getAllOnlineUsers().map((user) => (
            <div key={`${user.id}-${user.roomName}`} className="user-item">
              <div 
                className="status-indicator"
                style={{ backgroundColor: getStatusColor(user.status) }}
              />
              <span className="user-name">{user.name}</span>
              <span className="room-tag">{user.roomName}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
