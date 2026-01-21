import { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import './Sidebar.scss';

interface User {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'offline';
}

interface RoomWithUsers {
  id: string;
  name: string;
  users: User[];
}

const Sidebar = () => {
  const [selectedRoom, setSelectedRoom] = useState('general');
  const { rooms, loading, error } = useRooms();

  // Mock users for now - this could come from a real-time API later
  const mockUsers = [
    { id: '1', name: 'Simon Busborg', status: 'online' as const },
    { id: '2', name: 'Kurt Thyboe', status: 'online' as const },
    { id: '3', name: 'Maria Silva', status: 'idle' as const },
    { id: '4', name: 'João Santos', status: 'online' as const },
    { id: '5', name: 'Ana Costa', status: 'online' as const },
    { id: '6', name: 'Pedro Lima', status: 'offline' as const },
    { id: '7', name: 'Lucas Souza', status: 'idle' as const },
    { id: '8', name: 'Carla Dias', status: 'online' as const },
  ];

  // Combine API rooms with mock users for display
  const roomsWithUsers: RoomWithUsers[] = rooms.map((room, index) => ({
    id: room.id,
    name: room.name,
    users: mockUsers.slice(index * 2, (index * 2) + 2) // Assign 2 users per room for demo
  }));

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
    
    roomsWithUsers.forEach((room) => {
      room.users.forEach((user: User) => {
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
          {loading ? (
            <div className="loading-rooms">Loading rooms...</div>
          ) : error ? (
            <div className="error-rooms">Error loading rooms: {error}</div>
          ) : roomsWithUsers.length > 0 ? (
            roomsWithUsers.map((room) => (
              <button
                key={room.id}
                className={`room-item ${selectedRoom === room.id ? 'active' : ''}`}
                onClick={() => setSelectedRoom(room.id)}
              >
                <span className="room-name">{room.name}</span>
                <span className="room-users">{room.users.length}</span>
              </button>
            ))
          ) : (
            <div className="no-rooms">No rooms available</div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Room Users</h3>
        <div className="user-list">
          {roomsWithUsers
            .find((room) => room.id === selectedRoom)
            ?.users.map((user: User) => (
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
