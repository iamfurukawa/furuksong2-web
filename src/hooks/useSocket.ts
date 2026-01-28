import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketEvents = {
  USER_STATE_CHANGED: 'user-state-changed',
  SOUND_PLAYED: 'sound-played',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  ROOM_JOINED: 'room-joined',
  PLAY_SOUND: 'play-sound',
} as const;

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
  joinRoom: (roomId: string, name: string) => void;
  leaveRoom: () => void;
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

  newSocket.on(SocketEvents.USER_STATE_CHANGED, (state: UsersState) => {
    console.log('Estado dos usuários atualizado:', state);
    globalState.usersState = state;
    
    // Atualizar currentRoom baseado no estado do usuário atual
    const currentUser = state.connectedUsers.find(user => user.socketId === globalSocket?.id);
    if (currentUser) {
      globalState.currentRoom = currentUser.roomId || null;
    }
    
    notifyListeners();
  });

  newSocket.on(SocketEvents.ROOM_JOINED, (data: { roomId: string }) => {
    console.log('Sala confirmada:', data.roomId);
    globalState.currentRoom = data.roomId;
    notifyListeners();
  });

  newSocket.on(SocketEvents.SOUND_PLAYED, (data: { 
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

export const useSocket = (onSoundPlayed?: (data: { 
    soundId: string; 
    triggeredBy: string; 
    triggeredByName: string; 
    timestamp: string;
    roomId?: string;
  }) => void): SocketFunctions => {
  const [, forceUpdate] = useState({});
  const serverUrl = import.meta.env.VITE_FURUKSONG2_WEBSOCKET_URL;

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
  }, [onSoundPlayed]);

  // Funções
  const joinRoom = (roomId: string, name: string) => {
    if (globalSocket && globalState.connected) {
      globalSocket.emit(SocketEvents.JOIN_ROOM, { roomId, name });
    }
  };

  const leaveRoom = () => {
    if (globalSocket && globalState.connected && globalState.currentRoom) {
      globalSocket.emit(SocketEvents.LEAVE_ROOM);
      globalState.currentRoom = null;
      notifyListeners();
    }
  };

  const playSound = (soundId: string) => {
    if (globalSocket && globalState.connected && soundId) {
      globalSocket.emit(SocketEvents.PLAY_SOUND, { soundId });
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
