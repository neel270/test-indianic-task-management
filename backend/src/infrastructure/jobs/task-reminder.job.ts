import * as cron from 'node-cron';
import { TaskService } from '../../application/services/task.service';
import { ITaskRepository } from '../../domain/repositories/task.repository';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../repositories/task.repository.impl';
import { UserRepositoryImpl } from '../repositories/user.repository.impl';
import { TaskSocket } from '../sockets/task.socket';

export interface TaskReminderConfig {
  enabled: boolean;
  checkInterval: string; // Cron expression
  reminderTimes: number[]; // Hours before due date
  emailEnabled: boolean;
  socketEnabled: boolean;
}

export class TaskReminderJob {
  private taskService: TaskService;
  private taskSocket: TaskSocket;
  private config: TaskReminderConfig;
  private isRunning: boolean = false;
  private jobs: cron.ScheduledTask[] = [];

  constructor(
    taskSocket: TaskSocket,
    config?: Partial<TaskReminderConfig>
  ) {
    this.taskService = new TaskService(
      new TaskRepositoryImpl() as ITaskRepository,
      new UserRepositoryImpl() as IUserRepository
    );
    this.taskSocket = taskSocket;

    this.config = {
      enabled: true,
      checkInterval: '0 */6 * * *', // Every 6 hours
      reminderTimes: [24, 12, 6, 1], // 24h, 12h, 6h, 1h before due
      emailEnabled: true,
      socketEnabled: true,
      ...config
    };
  }

  /**
   * Start the task reminder job
   */
  public start(): void {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    console.log('Starting Task Reminder Job...');
    this.isRunning = true;

    // Schedule the main reminder check job
    const mainJob = cron.schedule(this.config.checkInterval, () => {
      this.checkAndSendReminders();
    }, {
      scheduled: false
    });

    mainJob.start();
    this.jobs.push(mainJob);

    // Schedule immediate reminders for tasks due soon (every 15 minutes)
    const immediateJob = cron.schedule('*/15 * * * *', () => {
      this.checkImmediateReminders();
    }, {
      scheduled: false
    });

    immediateJob.start();
    this.jobs.push(immediateJob);

    console.log('Task Reminder Job started successfully');
  }

  /**
   * Stop the task reminder job
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping Task Reminder Job...');
    this.isRunning = false;

    this.jobs.forEach(job => job.stop());
    this.jobs = [];

    console.log('Task Reminder Job stopped');
  }

  /**
   * Check and send reminders for tasks
   */
  private async checkAndSendReminders(): Promise<void> {
    try {
      console.log('Checking for tasks due soon...');

      for (const hours of this.config.reminderTimes) {
        const tasksDueSoon = await this.taskService.getTasksDueSoon(hours);

        for (const task of tasksDueSoon) {
          await this.sendTaskReminder(task, hours);
        }
      }

      console.log(`Processed reminders for ${this.config.reminderTimes.length} time intervals`);
    } catch (error) {
      console.error('Error in task reminder job:', error);
    }
  }

  /**
   * Check for immediate reminders (tasks due in next hour)
   */
  private async checkImmediateReminders(): Promise<void> {
    try {
      const tasksDueSoon = await this.taskService.getTasksDueSoon(1);

      for (const task of tasksDueSoon) {
        await this.sendImmediateTaskReminder(task);
      }
    } catch (error) {
      console.error('Error in immediate task reminder job:', error);
    }
  }

  /**
   * Send reminder for a specific task
   */
  private async sendTaskReminder(task: any, hoursBefore: number): Promise<void> {
    try {
      const reminderKey = `reminder_sent:${task.id}:${hoursBefore}h`;

      // Check if reminder was already sent (in a real app, use Redis)
      if (this.wasReminderSent(reminderKey)) {
        return;
      }

      const reminderData = {
        taskId: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        hoursUntilDue: hoursBefore,
        priority: task.priority,
        userId: task.userId
      };

      // Send socket notification
      if (this.config.socketEnabled) {
        this.taskSocket.sendNotificationToUser(task.userId, {
          type: 'task_reminder',
          title: 'Task Due Soon',
          message: `Your task "${task.title}" is due in ${hoursBefore} hours`,
          data: reminderData,
          timestamp: new Date()
        });
      }

      // Email notification can be added later when email service is implemented
      // if (this.config.emailEnabled) {
      //   await this.sendEmailReminder(task, hoursBefore);
      // }

      // Mark reminder as sent (in a real app, use Redis)
      this.markReminderAsSent(reminderKey);

      console.log(`Sent ${hoursBefore}h reminder for task: ${task.title}`);
    } catch (error) {
      console.error(`Error sending reminder for task ${task.id}:`, error);
    }
  }

  /**
   * Send immediate reminder for tasks due soon
   */
  private async sendImmediateTaskReminder(task: any): Promise<void> {
    try {
      const reminderData = {
        taskId: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        userId: task.userId,
        immediate: true
      };

      // Send urgent socket notification
      if (this.config.socketEnabled) {
        this.taskSocket.sendNotificationToUser(task.userId, {
          type: 'task_urgent_reminder',
          title: 'Task Due Very Soon!',
          message: `Your task "${task.title}" is due soon!`,
          data: reminderData,
          timestamp: new Date(),
          urgent: true
        });
      }

      // Email notification can be added later when email service is implemented
      // if (this.config.emailEnabled) {
      //   await this.sendUrgentEmailReminder(task);
      // }

      console.log(`Sent immediate reminder for task: ${task.title}`);
    } catch (error) {
      console.error(`Error sending immediate reminder for task ${task.id}:`, error);
    }
  }

  /**
   * Send email reminder
   */
  private async sendEmailReminder(task: any, hoursBefore: number): Promise<void> {
    try {
      const emailData = {
        to: task.userEmail || 'user@example.com', // In real app, get from user data
        subject: `Task Reminder: ${task.title}`,
        template: 'task-reminder',
        data: {
          taskTitle: task.title,
          taskDescription: task.description,
          dueDate: task.dueDate,
          hoursUntilDue: hoursBefore,
          priority: task.priority,
          actionUrl: `${process.env.FRONTEND_URL}/tasks/${task.id}`
        }
      };

      // await this.emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending email reminder:', error);
    }
  }

  /**
   * Send urgent email reminder
   */
  private async sendUrgentEmailReminder(task: any): Promise<void> {
    try {
      const emailData = {
        to: task.userEmail || 'user@example.com',
        subject: `URGENT: Task Due Soon - ${task.title}`,
        template: 'task-urgent-reminder',
        data: {
          taskTitle: task.title,
          taskDescription: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          actionUrl: `${process.env.FRONTEND_URL}/tasks/${task.id}`
        }
      };

      // await this.emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending urgent email reminder:', error);
    }
  }

  /**
   * Check if reminder was already sent (placeholder implementation)
   */
  private wasReminderSent(reminderKey: string): boolean {
    // In a real application, check Redis or database
    return false;
  }

  /**
   * Mark reminder as sent (placeholder implementation)
   */
  private markReminderAsSent(reminderKey: string): void {
    // In a real application, set Redis key with expiration
    console.log(`Marking reminder as sent: ${reminderKey}`);
  }

  /**
   * Get job status
   */
  public getStatus(): { isRunning: boolean; jobsCount: number; config: TaskReminderConfig } {
    return {
      isRunning: this.isRunning,
      jobsCount: this.jobs.length,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<TaskReminderConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.isRunning) {
      this.restart();
    }
  }

  /**
   * Restart the job with new configuration
   */
  private restart(): void {
    this.stop();
    this.start();
  }

  /**
   * Force send reminder for a specific task
   */
  public async forceSendReminder(taskId: string, hoursBefore: number): Promise<void> {
    try {
      const task = await this.taskService.getTaskById(taskId);
      if (task && task.status === 'Pending') {
        await this.sendTaskReminder(task, hoursBefore);
      }
    } catch (error) {
      console.error(`Error force sending reminder for task ${taskId}:`, error);
    }
  }

  /**
   * Get overdue tasks and send notifications
   */
  public async notifyOverdueTasks(): Promise<void> {
    try {
      const overdueTasks = await this.taskService.getOverdueTasks();

      for (const task of overdueTasks) {
        const reminderData = {
          taskId: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          userId: task.userId,
          overdue: true
        };

        // Send socket notification
        if (this.config.socketEnabled) {
          this.taskSocket.sendNotificationToUser(task.userId, {
            type: 'task_overdue',
            title: 'Task Overdue!',
            message: `Your task "${task.title}" is now overdue!`,
            data: reminderData,
            timestamp: new Date(),
            urgent: true
          });
        }

        // Email notification can be added later when email service is implemented
        // if (this.config.emailEnabled) {
        //   await this.sendOverdueEmailNotification(task);
        // }
      }

      console.log(`Sent overdue notifications for ${overdueTasks.length} tasks`);
    } catch (error) {
      console.error('Error notifying overdue tasks:', error);
    }
  }

  /**
   * Send overdue email notification
   */
  private async sendOverdueEmailNotification(task: any): Promise<void> {
    try {
      const emailData = {
        to: task.userEmail || 'user@example.com',
        subject: `OVERDUE: ${task.title}`,
        template: 'task-overdue',
        data: {
          taskTitle: task.title,
          taskDescription: task.description,
          dueDate: task.dueDate,
          daysOverdue: Math.floor((Date.now() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
          priority: task.priority,
          actionUrl: `${process.env.FRONTEND_URL}/tasks/${task.id}`
        }
      };

      // await this.emailService.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending overdue email notification:', error);
    }
  }
}
