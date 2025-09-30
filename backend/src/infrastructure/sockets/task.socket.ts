import { Socket, Server as SocketIOServer } from 'socket.io';
import { AuthService } from '../../application/services/auth.service';
import { TaskRepositoryImpl } from '../repositories/task.repository.impl';
import { UserRepositoryImpl } from '../repositories/user.repository.impl';

type AuthenticatedSocket = Socket & {
  userId?: string;
  userEmail?: string;
  userRole?: string;
};

export class TaskSocket {
  private io: SocketIOServer;
  private authService: AuthService;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  constructor(io: SocketIOServer) {
    this.io = io;
    this.authService = new AuthService(new UserRepositoryImpl(), new TaskRepositoryImpl());
    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers(): void {
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

          socket.join(`user:${decoded.userId}`);
          socket.join(`role:${decoded.role}`);

          socket.emit('authenticated', { success: true });
          console.log(`User ${decoded.email} authenticated on socket ${socket.id}`);
        } catch (error) {
          socket.emit('authentication_error', { message: 'Invalid token' });
          socket.disconnect();
        }
      });

      // Handle task creation
      socket.on('task_created', (taskData: any) => {
        if (socket.userId) {
          // Notify all users about new task (for admins) or just the user
          socket.broadcast.emit('task_created', {
            ...taskData,
            createdBy: socket.userId
          });

          // Also emit to user-specific room
          this.io.to(`user:${socket.userId}`).emit('task_created', taskData);
        }
      });

      // Handle task updates
      socket.on('task_updated', (taskData: any) => {
        if (socket.userId) {
          socket.broadcast.emit('task_updated', {
            ...taskData,
            updatedBy: socket.userId
          });
        }
      });

      // Handle task deletion
      socket.on('task_deleted', (taskData: any) => {
        if (socket.userId) {
          socket.broadcast.emit('task_deleted', {
            ...taskData,
            deletedBy: socket.userId
          });
        }
      });

      // Handle task status changes
      socket.on('task_status_changed', (taskData: any) => {
        if (socket.userId) {
          socket.broadcast.emit('task_status_changed', {
            ...taskData,
            changedBy: socket.userId
          });
        }
      });

      // Handle real-time task assignment
      socket.on('task_assigned', (taskData: any) => {
        if (socket.userId && taskData.assignedTo) {
          // Notify the assigned user
          this.io.to(`user:${taskData.assignedTo}`).emit('task_assigned', {
            ...taskData,
            assignedBy: socket.userId
          });

          socket.emit('task_assigned_success', { message: 'Task assigned successfully' });
        }
      });

      // Handle typing indicators for collaborative editing
      socket.on('typing_start', (taskId: string) => {
        if (socket.userId) {
          socket.broadcast.to(`task:${taskId}`).emit('user_typing_start', {
            userId: socket.userId,
            userEmail: socket.userEmail,
            taskId
          });
        }
      });

      socket.on('typing_stop', (taskId: string) => {
        if (socket.userId) {
          socket.broadcast.to(`task:${taskId}`).emit('user_typing_stop', {
            userId: socket.userId,
            userEmail: socket.userEmail,
            taskId
          });
        }
      });

      // Handle task comments (if implemented)
      socket.on('task_comment_added', (commentData: any) => {
        if (socket.userId) {
          socket.broadcast.emit('task_comment_added', {
            ...commentData,
            commentedBy: socket.userId
          });
        }
      });

      // Handle task reminders
      socket.on('task_reminder_due', (taskData: any) => {
        if (socket.userId) {
          this.io.to(`user:${socket.userId}`).emit('task_reminder', taskData);
        }
      });

      // Handle user status updates
      socket.on('user_online', () => {
        if (socket.userId) {
          socket.broadcast.emit('user_online', {
            userId: socket.userId,
            userEmail: socket.userEmail
          });
        }
      });

      socket.on('user_offline', () => {
        if (socket.userId) {
          socket.broadcast.emit('user_offline', {
            userId: socket.userId,
            userEmail: socket.userEmail
          });
        }
      });

      // Handle room joining for task collaboration
      socket.on('join_task_room', (taskId: string) => {
        socket.join(`task:${taskId}`);
        socket.emit('joined_task_room', { taskId });
      });

      socket.on('leave_task_room', (taskId: string) => {
        socket.leave(`task:${taskId}`);
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

              // Notify others that user went offline
              socket.broadcast.emit('user_offline', {
                userId: socket.userId,
                userEmail: socket.userEmail
              });
            }
          }
        }
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        socket.emit('error', { message: 'Socket connection error' });
      });
    });

    // Handle server-level events
    this.io.on('connection_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  // Method to emit task updates to specific users
  public emitTaskUpdateToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Method to emit task updates to all users with specific role
  public emitTaskUpdateToRole(role: string, event: string, data: any): void {
    this.io.to(`role:${role}`).emit(event, data);
  }

  // Method to emit task updates to all connected users
  public emitTaskUpdateToAll(event: string, data: any): void {
    this.io.emit(event, data);
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
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  // Method to broadcast task reminder
  public broadcastTaskReminder(taskData: any): void {
    this.io.emit('task_reminder', taskData);
  }

  // Method to broadcast system announcement
  public broadcastAnnouncement(announcement: any): void {
    this.io.emit('system_announcement', announcement);
  }
}
