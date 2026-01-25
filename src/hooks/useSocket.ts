import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  socketId: string;
  name: string;
  roomId?: string;
}

interface UsersState {
  rooms: {
    [roomId: string]: {
      users: { socketId: string; name: string }[];
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
  onSoundPlayed?: (data: { 
    soundId: string; 
    triggeredBy: string; 
    triggeredByName: string; 
    timestamp: string;
    roomId?: string;
  }) => void;
}

export const useSocket = (serverUrl: string, onSoundPlayed?: (data: { 
    soundId: string; 
    triggeredBy: string; 
    triggeredByName: string; 
    timestamp: string;
    roomId?: string;
  }) => void): SocketFunctions => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [usersState, setUsersState] = useState<UsersState>({
    rooms: {},
    connectedUsers: []
  });
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const initializedRef = useRef(false);

  // Funções estáveis usando useCallback para evitar recriação
  const joinRoom = useCallback((roomId: string, userName: string) => {
    if (socket && connected) {
      socket.emit('join-room', { roomId, name: userName });
    }
  }, [socket, connected]);

  const leaveRoom = useCallback((roomId: string) => {
    if (socket && connected) {
      socket.emit('leave-room', { roomId });
    }
  }, [socket, connected]);

  const playSound = useCallback((soundId: string) => {
    if (socket && connected && soundId) {
      socket.emit('play-sound', { soundId });
    } else {
      console.warn('Socket not connected, connected, or no soundId provided');
    }
  }, [socket, connected]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }
  }, [socket]);

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (initializedRef.current) {
      console.log('Socket already initialized, skipping...');
      return;
    }

    initializedRef.current = true;
    console.log('Initializing socket connection...');
    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = newSocket;

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
      socketRef.current = null;
      initializedRef.current = false; // Permitir reinitialização
    });

    newSocket.on('user-state-changed', (state: UsersState) => {
      console.log('Estado dos usuários atualizado:', state);
      setUsersState(state);
    });

    newSocket.on('joined-room', (data: { roomId: string }) => {
      console.log('Entrou na sala:', data.roomId);
      setCurrentRoom(data.roomId);
    });

    newSocket.on('left-room', (data: { roomId: string }) => {
      console.log('Saiu na sala:', data.roomId);
      setCurrentRoom(null);
    });

    newSocket.on('sound-played', (data: { 
      soundId: string; 
      triggeredBy: string; 
      triggeredByName: string; 
      timestamp: string 
    }) => {
      console.log('Som tocado:', data);
      
      if (onSoundPlayed) {
        onSoundPlayed(data);
      }
    });

    return () => {
      console.log('Cleaning up socket connection...');
      if (newSocket) {
        newSocket.disconnect();
      }
      socketRef.current = null;
      initializedRef.current = false;
    };
  }, [serverUrl, onSoundPlayed]);

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
