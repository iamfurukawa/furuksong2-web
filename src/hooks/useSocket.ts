import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  socketId: string;
  name: string;
  roomId?: string;
}

interface UsersState {
  totalUsers: number;
  totalRooms: number;
  rooms: {
    [roomId: string]: {
      users: { socketId: string; name: string }[];
      count: number;
    };
  };
  connectedUsers: User[];
}

interface SocketFunctions {
  socket: Socket | null;
  connected: boolean;
  usersState: UsersState;
  currentRoom: string | null;
  joinRoom: (roomId: string, userName: string) => void;
  leaveRoom: (roomId: string) => void;
  playSound: (soundId: string) => void;
  disconnect: () => void;
}

export const useSocket = (serverUrl: string): SocketFunctions => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [usersState, setUsersState] = useState<UsersState>({
    totalUsers: 0,
    totalRooms: 0,
    rooms: {},
    connectedUsers: []
  });
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      upgrade: false
    });

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor WebSocket');
      setConnected(true);
      setSocket(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado do servidor WebSocket');
      setConnected(false);
      setSocket(null);
      setCurrentRoom(null);
    });

    newSocket.on('user-state-changed', (state: UsersState) => {
      console.log('Estado dos usuários atualizado:', state);
      setUsersState(state);
    });

    newSocket.on('joined-room', (data: { roomId: string }) => {
      console.log('Entrou na sala:', data.roomId);
      // Não atualizar currentRoom aqui para evitar race condition
    });

    newSocket.on('left-room', (data: { roomId: string }) => {
      console.log('Saiu da sala:', data.roomId);
      // Não atualizar currentRoom aqui para evitar race condition
    });

    newSocket.on('sound-played', (data: { 
      soundId: string; 
      triggeredBy: string; 
      triggeredByName: string; 
      timestamp: string 
    }) => {
      console.log('Som tocado:', data);
      // Aqui podemos adicionar lógica para mostrar notificações
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [serverUrl]);

  const joinRoom = (roomId: string, userName: string) => {
    if (socket) {
      socket.emit('join-room', { roomId, name: userName });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit('leave-room', { roomId });
    }
  };

  const playSound = (soundId: string) => {
    if (socket) {
      socket.emit('play-sound', { soundId });
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return {
    socket,
    connected,
    usersState,
    currentRoom,
    joinRoom,
    leaveRoom,
    playSound,
    disconnect
  };
};
