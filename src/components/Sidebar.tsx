import { useState, useEffect } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
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
  const { user } = useAuth();
  const { rooms, loading, error } = useRooms();
  const { connected, usersState, joinRoom, leaveRoom, currentRoom } = useSocket('ws://localhost:3000');

  const userName = user?.name || 'Guest User';

  // Combine API rooms with WebSocket users state
  const roomsWithUsers: RoomWithUsers[] = rooms.map((room) => {
    const wsRoomUsers = usersState.rooms[room.id]?.users || [];
    const displayUsers = wsRoomUsers.length > 0 
      ? wsRoomUsers.map((user: any) => ({
          id: user.socketId,
          name: user.name,
          status: 'online' as const
        }))
      : []; // No fallback users when no real users

    return {
      id: room.id,
      name: room.name,
      users: displayUsers
    };
  });

  const handleRoomClick = (roomId: string) => {
    if (!connected) return;
    
    if (currentRoom === roomId) {
      console.log('Já está na sala:', roomId);
      return;
    }
    
    const previousRoom = currentRoom;
    
    // Sair da sala atual primeiro
    if (previousRoom) {
      leaveRoom(previousRoom);
    }
    
    // Depois entrar na nova sala
    joinRoom(roomId, userName);
    setSelectedRoom(roomId);
  };

  useEffect(() => {
    // Auto-connect to WebSocket when available, but don't join any room automatically
    if (connected && roomsWithUsers.length > 0 && !currentRoom) {
      console.log('WebSocket connected and rooms available, ready for manual room selection');
    }
  }, [connected, roomsWithUsers, currentRoom]);

  useEffect(() => {
    return () => {
      if (currentRoom && connected) {
        leaveRoom(currentRoom);
      }
    };
  }, [currentRoom, connected, leaveRoom]);

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
    
    Object.entries(usersState.rooms).forEach(([roomId, roomData]) => {
      const room = roomsWithUsers.find(r => r.id === roomId);
      if (room) {
        roomData.users.forEach((user: any) => {
          allOnlineUsers.push({
            id: user.socketId,
            name: user.name,
            status: 'online' as const,
            roomName: room.name
          });
        });
      }
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
                className={`room-item ${selectedRoom === room.id ? 'active' : ''} ${currentRoom === room.id ? 'connected' : ''}`}
                onClick={() => handleRoomClick(room.id)}
              >
                <span className="room-name">{room.name}</span>
                <span className="room-users">{room.users.length}</span>
                {connected && (
                  <div className="connection-indicator">
                    <div className={`status-dot ${currentRoom === room.id ? 'active' : 'inactive'}`} />
                  </div>
                )}
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
