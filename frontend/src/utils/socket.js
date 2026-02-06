// src/utils/socket.js
import { io } from 'socket.io-client';

export let socket = null;

export const initSocket = (userId) => {
  if (socket && (socket.connected || socket.connecting)) {
    console.log('[socket.js] Reusing existing socket');
    return socket;
  }

  socket = io('http://localhost:5000', {
    reconnection: true,
    reconnectionAttempts: 15,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('[socket.js] Connected - ID:', socket.id);
    if (userId) {
      socket.emit('joinRoom', userId.toString());
      console.log('[socket.js] joinRoom emitted for:', userId);
    }
  });

  socket.on('connect_error', (err) => console.error('[socket.js] Connect error:', err.message));

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('[socket.js] Disconnected');
  }
};