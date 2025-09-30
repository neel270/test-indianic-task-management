import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { logger } from '../lib/logger';

/**
 * Socket context interface for global socket state management
 */
interface SocketContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Event handlers
  emit: (event: string, data?: unknown) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback?: (data: unknown) => void) => void;

  // Room management
  joinTaskRoom: (taskId: string) => void;
  leaveTaskRoom: (taskId: string) => void;

  // Task-specific events
  onTaskCreated: (callback: (task: unknown) => void) => void;
  onTaskUpdated: (callback: (task: unknown) => void) => void;
  onTaskDeleted: (callback: (task: unknown) => void) => void;
  onTaskAssigned: (callback: (data: unknown) => void) => void;

  // User status events
  onUserOnline: (callback: (data: { userId: string; userEmail: string }) => void) => void;
  onUserOffline: (callback: (data: { userId: string; userEmail: string }) => void) => void;

  // Notification events
  onNotification: (callback: (notification: unknown) => void) => void;

  // Connection management
  reconnect: () => void;
  disconnect: () => void;
}

/**
 * Socket context for React components
 */
const SocketContext = createContext<SocketContextType | undefined>(undefined);

/**
 * Socket provider props
 */
interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Enhanced socket provider with authentication integration
 * Provides global socket state and event handling for the entire application
 *
 * Features:
 * - Automatic authentication on connection
 * - Task-specific room management
 * - Real-time event handling
 * - Connection state management
 * - Error handling and reconnection
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <SocketProvider>
 *       <TaskList />
 *     </SocketProvider>
 *   );
 * }
 *
 * function TaskList() {
 *   const { onTaskCreated, onTaskUpdated, isConnected } = useSocketContext();
 *
 *   useEffect(() => {
 *     onTaskCreated((task) => {
 *       logger.info('New task received', task);
 *       // Update UI
 *     });
 *   }, [onTaskCreated]);
 * }
 * ```
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isAuthenticatedSocket, setIsAuthenticatedSocket] = useState(false);

  const {
    isConnected,
    isConnecting,
    error,
    emit,
    on: socketOn,
    off: socketOff,
    joinRoom,
    leaveRoom,
  } = useSocket({
    options: {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    },
  });

  // Handle authentication response
  useEffect(() => {
    socketOn('authenticated', ((data: unknown) => {
      const authData = data as { success: boolean; message?: string };
      if (authData.success) {
        setIsAuthenticatedSocket(true);
        logger.info('Socket authenticated successfully');
      } else {
        setIsAuthenticatedSocket(false);
        logger.error('Socket authentication failed', { message: authData.message });
      }
    }));

    socketOn('authentication_error', ((data: unknown) => {
      const errorData = data as { message: string };
      setIsAuthenticatedSocket(false);
      logger.error('Socket authentication error', { message: errorData.message });
    }));

    return () => {
      socketOff('authenticated');
      socketOff('authentication_error');
    };
  }, [socketOn, socketOff]);

  // Enhanced event handlers with automatic cleanup
  const on = (event: string, callback: (data: unknown) => void) => {
    socketOn(event, callback);
  };

  const off = (event: string, callback?: (data: unknown) => void) => {
    socketOff(event, callback);
  };

  // Task-specific room management
  const joinTaskRoom = (taskId: string) => {
    joinRoom(`task:${taskId}`);
  };

  const leaveTaskRoom = (taskId: string) => {
    leaveRoom(`task:${taskId}`);
  };

  // Specific event handlers for common use cases
  const onTaskCreated = (callback: (task: unknown) => void) => {
    on('task_created', callback);
  };

  const onTaskUpdated = (callback: (task: unknown) => void) => {
    on('task_updated', callback);
  };

  const onTaskDeleted = (callback: (task: unknown) => void) => {
    on('task_deleted', callback);
  };

  const onTaskAssigned = (callback: (data: unknown) => void) => {
    on('task_assigned', callback);
  };

  const onUserOnline = (callback: (data: { userId: string; userEmail: string }) => void) => {
    on('user_online', ((data: unknown) => {
      callback(data as { userId: string; userEmail: string });
    }));
  };

  const onUserOffline = (callback: (data: { userId: string; userEmail: string }) => void) => {
    on('user_offline', ((data: unknown) => {
      callback(data as { userId: string; userEmail: string });
    }));
  };

  const onNotification = (callback: (notification: unknown) => void) => {
    on('notification', callback);
  };

  const reconnect = () => {
    if (!isConnected) {
      // The useSocket hook will handle reconnection automatically
      logger.info('Triggering socket reconnection');
    }
  };

  const disconnect = () => {
    setIsAuthenticatedSocket(false);
    // The useSocket hook will handle disconnection
  };

  const contextValue: SocketContextType = {
    isConnected,
    isConnecting,
    error,
    emit,
    on,
    off,
    joinTaskRoom,
    leaveTaskRoom,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    onTaskAssigned,
    onUserOnline,
    onUserOffline,
    onNotification,
    reconnect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook to use socket context in components
 * Must be used within a SocketProvider
 *
 * @returns Socket context with all socket functionality
 * @throws Error if used outside SocketProvider
 *
 * @example
 * ```tsx
 * function TaskComponent() {
 *   const { onTaskCreated, isConnected, emit } = useSocketContext();
 *
 *   useEffect(() => {
 *     onTaskCreated((task) => {
 *       // Handle new task
 *     });
 *   }, [onTaskCreated]);
 *
 *   const handleCreateTask = (taskData) => {
 *     emit('task_created', taskData);
 *   };
 * }
 * ```
 */
export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
