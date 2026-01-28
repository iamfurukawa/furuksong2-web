import { useState, useEffect } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useSocket } from '../hooks/useSocket';
import './Sidebar.scss';

interface User {
  id: string;
  name: string;
}

interface RoomWithUsers {
  id: string;
  name: string;
  users: User[];
}

const Sidebar = () => {
  const [selectedRoom, setSelectedRoom] = useState(() => {
    const saved = localStorage.getItem('soundboard-current-room');
    return saved || null;
  });
  const [userName] = useState(() => {
    const saved = localStorage.getItem('soundboard-user');
    return saved || 'Guest User';
  });

  const { rooms, loading, error } = useRooms();
  const { connected, usersState, joinRoom, leaveRoom, currentRoom } = useSocket();

  // Combine API rooms with WebSocket users state
  const roomsWithUsers: RoomWithUsers[] = (rooms || []).map((room) => {
    const wsRoomUsers = usersState.rooms[room.id]?.users || [];
    const displayUsers = wsRoomUsers.length > 0 
      ? wsRoomUsers.map((user: any) => ({
          id: user.socketId,
          name: user.name
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
    
    if (currentRoom === roomId) return;
    
    // Entrar diretamente na nova sala (servidor vai sair da anterior automaticamente)
    joinRoom(roomId, userName);
    setSelectedRoom(roomId);
    
    // Salvar sala atual no localStorage
    localStorage.setItem('soundboard-current-room', roomId);
  };

  const handleLeaveRoom = () => {
    if (!connected || !currentRoom) return;
    
    leaveRoom();
    setSelectedRoom(null);
    localStorage.removeItem('soundboard-current-room');
  };

  useEffect(() => {
    // Auto-connect to WebSocket when available and join saved room
    if (connected && roomsWithUsers.length > 0 && !currentRoom) {
      const savedRoom = localStorage.getItem('soundboard-current-room');
      
      // Entrar apenas se houver uma sala salva e ela existir
      if (savedRoom) {
        const roomExists = roomsWithUsers.some(room => room.id === savedRoom);
        
        if (roomExists) {
          console.log(`WebSocket connected, joining saved room: ${savedRoom}`);
          joinRoom(savedRoom, userName);
          setSelectedRoom(savedRoom);
        } else {
          // Limpar localStorage se sala não existir mais
          localStorage.removeItem('soundboard-current-room');
        }
      }
      // Se não houver sala salva, não entrar em nenhuma sala automaticamente
    }
  }, [connected, roomsWithUsers.length, currentRoom, joinRoom, userName]);

  const getAllOnlineUsers = () => {
    const allOnlineUsers: (User & { roomName: string })[] = [];
    
    Object.entries(usersState.rooms).forEach(([roomId, roomData]) => {
      const room = roomsWithUsers.find(r => r.id === roomId);
      if (room) {
        roomData.users.forEach((user: any) => {
          allOnlineUsers.push({
            id: user.socketId,
            name: user.name,
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

      {currentRoom && (
        <div className="sidebar-section">
          <button 
            className="leave-room-button"
            onClick={handleLeaveRoom}
            disabled={!connected}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Leave Room
          </button>
        </div>
      )}

      <div className="sidebar-section">
        <h3>Users in this room</h3>
        <div className="user-list">
          {selectedRoom ? (
            roomsWithUsers
              .find((room) => room.id === selectedRoom)
              ?.users.map((user: User) => (
                <div key={user.id} className="user-item">
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: '#43b581' }}
                  />
                  <span className="user-name">{user.name}</span>
                </div>
              )) || <div className="no-users">No users in this room</div>
          ) : (
            <div className="no-users">Select a room to see users</div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Where is?</h3>
        <div className="user-list">
          {getAllOnlineUsers().map((user) => (
            <div key={`${user.id}-${user.roomName}`} className="user-item">
              <div 
                className="status-indicator"
                style={{ backgroundColor: '#43b581' }}
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
