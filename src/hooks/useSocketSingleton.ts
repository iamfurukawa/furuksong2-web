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
  onSoundPlayed?: (data: { 
    soundId: string; 
    triggeredBy: string; 
    triggeredByName: string; 
    timestamp: string;
    roomId?: string;
  }) => void;
}

// Singleton global para WebSocket
let globalSocket: Socket | null = null;
let globalCallbacks: {
  onSoundPlayed?: (data: { 
    soundId: string; 
    triggeredBy: string; 
    triggeredByName: string; 
    timestamp: string;
    roomId?: string;
  }) => void;
  onUsersStateChange?: (state: UsersState) => void;
  onConnectedChange?: (connected: boolean) => void;
  onCurrentRoomChange?: (roomId: string | null) => void;
} = {};

let globalState: {
  connected: boolean;
  usersState: UsersState;
  currentRoom: string | null;
} = {
  connected: false,
  usersState: {
    totalUsers: 0,
    totalRooms: 0,
    rooms: {},
    connectedUsers: []
  },
  currentRoom: null
};

let listeners: Set<() => void> = new Set();

const initializeSocket = (serverUrl: string) => {
  if (globalSocket) {
    console.log('Socket already initialized globally');
    return;
  }

  console.log('Initializing global socket...');
  const newSocket = io(serverUrl, {
    transports: ['websocket'],
    upgrade: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  globalSocket = newSocket;

  newSocket.on('connect', () => {
    console.log('Conectado ao servidor WebSocket');
    globalState.connected = true;
    notifyListeners();
  });

  newSocket.on('disconnect', () => {
    console.log('Desconectado do servidor WebSocket');
    globalSocket = null;
    globalState.connected = false;
    globalState.currentRoom = null;
    notifyListeners();
  });

  newSocket.on('user-state-changed', (state: UsersState) => {
    console.log('Estado dos usuários atualizado:', state);
    globalState.usersState = state;
    notifyListeners();
  });

  newSocket.on('joined-room', (data: { roomId: string }) => {
    console.log('Entrou na sala:', data.roomId);
    globalState.currentRoom = data.roomId;
    notifyListeners();
  });

  newSocket.on('left-room', (data: { roomId: string }) => {
    console.log('Saiu na sala:', data.roomId);
    globalState.currentRoom = null;
    notifyListeners();
  });

  newSocket.on('sound-played', (data: { 
    soundId: string; 
    triggeredBy: string; 
    triggeredByName: string; 
    timestamp: string 
  }) => {
    console.log('Som tocado:', data);
    
    if (globalCallbacks.onSoundPlayed) {
      globalCallbacks.onSoundPlayed(data);
    }
  });
};

const notifyListeners = () => {
  listeners.forEach(listener => listener());
};

export const useSocket = (serverUrl: string, onSoundPlayed?: (data: { 
    soundId: string; 
    triggeredBy: string; 
    triggeredByName: string; 
    timestamp: string;
    roomId?: string;
  }) => void): SocketFunctions => {
  const [, forceUpdate] = useState({});

  // Atualizar callbacks
  globalCallbacks.onSoundPlayed = onSoundPlayed;

  // Adicionar listener
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);

    // Inicializar socket se necessário
    if (!globalSocket) {
      initializeSocket(serverUrl);
    }

    return () => {
      listeners.delete(listener);
    };
  }, [serverUrl, onSoundPlayed]);

  // Funções
  const joinRoom = (roomId: string, userName: string) => {
    if (globalSocket && globalState.connected) {
      globalSocket.emit('join-room', { roomId, name: userName });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (globalSocket && globalState.connected) {
      globalSocket.emit('leave-room', { roomId });
    }
  };

  const playSound = (soundId: string) => {
    if (globalSocket && globalState.connected && soundId) {
      globalSocket.emit('play-sound', { soundId });
    } else {
      console.warn('Socket not connected, connected, or no soundId provided');
    }
  };

  const disconnect = () => {
    if (globalSocket) {
      globalSocket.disconnect();
    }
  };

  return {
    socket: globalSocket,
    connected: globalState.connected,
    usersState: globalState.usersState,
    currentRoom: globalState.currentRoom,
    joinRoom,
    leaveRoom,
    playSound,
    disconnect,
    onSoundPlayed
  };
};
