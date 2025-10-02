import { Socket, Server as SocketIOServer } from 'socket.io';
import { AuthService } from '../../application/services/auth.service';

type AuthenticatedSocket = Socket & {
  userId?: string;
  userEmail?: string;
  userRole?: string;
};

export class TaskSocket {
  private io: SocketIOServer | null = null;
  private authService: AuthService;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io?: SocketIOServer) {
    this.authService = new AuthService();

    if (io) {
      console.log('TaskSocket: SocketIO server provided, validating...');
      console.log('TaskSocket: Server type:', io.constructor?.name);
      console.log('TaskSocket: Has on method:', typeof io.on === 'function');
      console.log('TaskSocket: Has emit method:', typeof io.emit === 'function');

      if (this.isValidSocketIOServer(io)) {
        this.io = io;
        console.log('TaskSocket: SocketIO server validated successfully');
        this.initializeSocketHandlers();
      } else {
        console.warn(
          'TaskSocket: Provided server failed validation. Socket functionality will be disabled.'
        );
        console.warn('TaskSocket: Expected SocketIO Server, got:', typeof io);
      }
    } else {
      console.warn(
        'TaskSocket: No SocketIO server provided. Socket functionality will be disabled.'
      );
    }
  }

  private isValidSocketIOServer(io: any): io is SocketIOServer {
    // More robust validation for SocketIO server
    if (!io || typeof io !== 'object') {
      console.log('TaskSocket: io is not an object:', typeof io);
      return false;
    }

    if (typeof io.on !== 'function') {
      console.log('TaskSocket: io.on is not a function:', typeof io.on);
      return false;
    }

    if (typeof io.emit !== 'function') {
      console.log('TaskSocket: io.emit is not a function:', typeof io.emit);
      return false;
    }

    // Check for SocketIO specific methods (these might not exist in older versions)
    const hasToMethod = typeof io.to === 'function';
    const hasInMethod = typeof io.in === 'function';
    const constructorName = io.constructor?.name;

    console.log('TaskSocket: SocketIO validation details:', {
      hasToMethod,
      hasInMethod,
      constructorName,
      isValid: true, // If we get here, basic validation passed
    });

    // Accept the server if it has the basic required methods
    return true;
  }

  private initializeSocketHandlers(): void {
    if (!this.io) {
      return;
    }

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log('User connected:', socket.id);

      // Handle authentication
      socket.on('authenticate', async (token: string) => {
        try {
          const decoded = await this.authService.verifyAccessToken(token);
          socket.userId = decoded.userId;
          socket.userEmail = decoded.email;
          socket.userRole = decoded.role;

          // Track user sockets
          if (!this.userSockets.has(decoded.userId)) {
            this.userSockets.set(decoded.userId, new Set());
          }
          this.userSockets.get(decoded.userId)!.add(socket.id);

          await socket.join(`user:${decoded.userId}`);
          await socket.join(`role:${decoded.role}`);

          socket.emit('authenticated', { success: true });
          console.log(`User ${decoded.email} authenticated on socket ${socket.id}`);
        } catch {
          socket.emit('authentication_error', { message: 'Invalid token' });
          socket.disconnect();
        }
      });

      // Handle task creation
      socket.on('task_created', (taskData: any) => {
        // Notify all connected users about new task
        if (this.io) {
          this.io.emit('task_created', {
            ...taskData,
          });
        }
      });

      // Handle task updates
      socket.on('task_updated', (taskData: any) => {
        if (this.io) {
          this.io.emit('task_updated', {
            ...taskData,
            updatedBy: socket.userId,
          });
        }
      });

      // Handle task deletion
      socket.on('task_deleted', (taskData: any) => {
        if (this.io) {
          this.io.emit('task_deleted', {
            ...taskData,
            deletedBy: socket.userId,
          });
        }
      });

      // Handle task status changes
      socket.on('task_status_changed', (taskData: any) => {
        if (this.io) {
          this.io.emit('task_status_changed', {
            ...taskData,
          });
        }
      });

      // Handle real-time task assignment
      socket.on('task_assigned', (taskData: any) => {
        if (taskData.assignedTo) {
          // Notify all connected users about task assignment
          if (this.io) {
            this.io.emit('task_assigned', {
              ...taskData,
            });
          }

          socket.emit('task_assigned_success', { message: 'Task assigned successfully' });
        }
      });
      // Handle task reminders
      socket.on('task_reminder_due', (taskData: any) => {
        if (socket.userId) {
          if (this.io) {
            this.io.emit('task_reminder', taskData);
          }
        }
      });
      // Handle room joining for task collaboration
      socket.on('join_task_room', async (taskId: string) => {
        await socket.join(`task:${taskId}`);
        socket.emit('joined_task_room', { taskId });
      });

      socket.on('leave_task_room', async (taskId: string) => {
        await socket.leave(`task:${taskId}`);
        socket.emit('left_task_room', { taskId });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
          // Remove socket from user tracking
          const userSocketIds = this.userSockets.get(socket.userId);
          if (userSocketIds) {
            userSocketIds.delete(socket.id);
            if (userSocketIds.size === 0) {
              this.userSockets.delete(socket.userId);
            }
          }
        }
      });

      // Handle connection errors
      socket.on('error', error => {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'Socket connection error' });
      });
    });

    // Handle server-level events
    this.io.on('connection_error', error => {
      console.error('Connection error:', error);
    });
  }

  // Method to emit task updates to all connected users
  public emitTaskUpdateToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  // Method to get online users count
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Method to get online users
  public getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Method to check if user is online
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Method to send notification to specific user
  public sendNotificationToUser(userId: string, notification: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification', notification);
    }
  }
}
