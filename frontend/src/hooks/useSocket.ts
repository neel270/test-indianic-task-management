import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '../lib/logger';

/**
 * Socket event types for better type safety
 */
export type SocketEventData = {
  // Authentication events
  authenticate: string;
  authenticated: { success: boolean; message?: string };
  authentication_error: { message: string };

  // Task events
  task_created: {
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
  };
  task_updated: {
    id: string;
    title?: string;
    description?: string;
    status?: string;
    dueDate?: string;
  };
  task_deleted: { id: string };
  task_status_changed: { id: string; status: string };
  task_assigned: { taskId: string; userId: string; userEmail: string };
  task_assigned_success: { message: string };

  // Collaboration events
  typing_start: { taskId: string; userId: string; userEmail: string };
  typing_stop: { taskId: string; userId: string; userEmail: string };
  user_typing_start: { userId: string; userEmail: string; taskId: string };
  user_typing_stop: { userId: string; userEmail: string; taskId: string };

  // Comment events
  task_comment_added: {
    taskId: string;
    commentId: string;
    userId: string;
    userEmail: string;
    content: string;
    createdAt: string;
  };

  // Reminder events
  task_reminder: { taskId: string; reminderTime: string; message: string };
  task_reminder_due: { taskId: string; title: string; dueDate: string };

  // User status events
  user_online: { userId: string; userEmail: string };
  user_offline: { userId: string; userEmail: string };

  // Room events
  join_task_room: string;
  leave_task_room: string;
  joined_task_room: { taskId: string };
  left_task_room: { taskId: string };

  // Notification events
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    createdAt: string;
  };

  // System events
  system_announcement: {
    id: string;
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
  };

  // Connection events (handled by Socket.IO internally)
  connect: never;
  disconnect: never;
  connect_error: never;
  error: { message: string };
};

/**
 * Socket configuration options
 */
interface UseSocketOptions {
  url?: string;
  options?: {
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
  };
}

/**
 * Return type for useSocket hook
 */
interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback?: (data: unknown) => void) => void;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
}

/**
 * Enhanced React hook for Socket.IO client with TypeScript support
 * Provides real-time communication capabilities with proper error handling and reconnection
 *
 * @param options - Socket configuration options
 * @returns Socket hook interface with connection state and event handling methods
 *
 * @example
 * ```typescript
 * const { isConnected, emit, on, joinRoom } = useSocket({
 *   url: 'http://localhost:3000',
 *   options: { autoConnect: true }
 * });
 *
 * useEffect(() => {
 *   on('task_created', (task) => {
 *     logger.info('New task received', task);
 *   });
 *
 *   emit('authenticate', token);
 * }, [on, emit]);
 * ```
 */
export const useSocket = (options: UseSocketOptions = {}): UseSocketReturn => {
  const {
    url = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000',
    options: socketOptions = {},
  } = options;

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    setIsConnecting(true);
    setError(null);

    // Create socket instance with enhanced configuration
    socketRef.current = io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      ...socketOptions,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      logger.info('Socket connected successfully');
    });

    socket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      setIsConnecting(false);
      logger.info('Socket disconnected', { reason });
    });

    socket.on('connect_error', (error: Error) => {
      setIsConnecting(false);
      setError(`Connection failed: ${error.message}`);
      logger.error('Socket connection error', { message: error.message });
    });

    socket.on('error', (data: { message: string }) => {
      setError(data.message);
      logger.error('Socket error', { message: data.message });
    });

    // Auto-connect if enabled (default: true)
    if (socketOptions?.autoConnect !== false) {
      socket.connect();
    }

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socket.removeAllListeners();
      socketRef.current = null;
    };
  }, [url, socketOptions?.autoConnect]);

  const connect = useCallback(() => {
    if (socketRef.current && !socketRef.current.connected) {
      setIsConnecting(true);
      setError(null);
      socketRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      logger.warn('Cannot emit event, socket not connected', { event });
    }
  }, []);

  const on = useCallback((event: string, callback: (data: unknown) => void) => {
    socketRef.current?.on(event, callback);
  }, []);

  const off = useCallback((event: string, callback?: (data: unknown) => void) => {
    if (callback) {
      socketRef.current?.off(event, callback);
    } else {
      socketRef.current?.off(event);
    }
  }, []);

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_task_room', room);
    } else {
      logger.warn('Cannot join room, socket not connected', { room });
    }
  }, []);

  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_task_room', room);
    } else {
      logger.warn('Cannot leave room, socket not connected', { room });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
  };
};
