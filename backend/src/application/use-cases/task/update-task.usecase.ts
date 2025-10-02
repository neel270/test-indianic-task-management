import { TaskEntity } from '../../../domain/entities/task.entity';
import { UpdateTaskDto } from '../../dtos/task.dto';
import { TaskService } from '../../services/task.service';
import { EmailService } from '../../../infrastructure/services/email.service';
import { TaskSocket } from '../../../infrastructure/sockets/task.socket';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../../../infrastructure/config/env';

export class UpdateTaskUseCase {
  private taskService: TaskService;
  private emailService: EmailService;
  private taskSocket: TaskSocket;

  constructor() {
    this.taskService = new TaskService();
    this.emailService = new EmailService();
    this.taskSocket = new TaskSocket();
  }

  async execute(
    taskId: string,
    taskData: UpdateTaskDto,
    userId: string,
    files?: Express.Multer.File[]
  ): Promise<TaskEntity> {
    try {
      // Get the existing task first
      const existingTask = await this.taskService.getTaskById(taskId, userId);
      if (!existingTask) {
        throw new Error('Task not found');
      }
      // Handle file uploads if provided
      let finalAttachments: string[] = taskData.attachments ?? existingTask.attachments;
      if (files && files.length > 0) {
        const uploadDir = env.uploadDir;
        const taskUploadDir = path.join(uploadDir, userId, 'tasks', taskId);
        // Ensure upload directory exists
        fs.mkdirSync(taskUploadDir, { recursive: true });
        const newAttachmentFileNames: string[] = [];
        for (const file of files) {
          const fileName = file.filename; // Multer already generated unique filename
          const tempFilePath = file.path;
          const finalFilePath = path.join(taskUploadDir, fileName);
          // Move file from temp location to final location
          fs.renameSync(tempFilePath, finalFilePath);
          newAttachmentFileNames.push(fileName);
        }

        // Combine existing attachments with new file names
        finalAttachments = [...existingTask.attachments, ...newAttachmentFileNames];
      } else if (taskData.attachments !== undefined) {
        // If no files uploaded but attachments provided in request, use those
        finalAttachments = taskData.attachments;
      }

      const updatePayload: {
        title?: string;
        description?: string;
        status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
        dueDate?: Date;
        priority?: 'Low' | 'Medium' | 'High';
        tags?: string[];
        attachments?: string[];
      } = {};

      if (taskData.title !== undefined) {
        updatePayload.title = taskData.title;
      }
      if (taskData.description !== undefined) {
        updatePayload.description = taskData.description;
      }
      if (taskData.status !== undefined) {
        updatePayload.status = taskData.status;
      }
      if (taskData.dueDate !== undefined) {
        updatePayload.dueDate = new Date(taskData.dueDate);
      }
      if (taskData.priority !== undefined) {
        updatePayload.priority = taskData.priority;
      }
      if (taskData.tags !== undefined) {
        updatePayload.tags = taskData.tags;
      }
      if (finalAttachments !== undefined) {
        updatePayload.attachments = finalAttachments;
      }

      const task = await this.taskService.updateTask(taskId, updatePayload, userId);

      // Send notifications for task updates
      try {
        const taskData = {
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority,
          userEmail: task.assignedTo, // This should be the assigned user's email
          status: task.status,
        };

        // Emit socket event for real-time updates
        this.taskSocket.emitTaskUpdateToAll('task_updated', {
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
          assignedTo: task.assignedTo,
          userId: task.userId,
          priority: task.priority,
          tags: task.tags,
          attachments: task.attachments,
          updatedAt: task.updatedAt,
          updatedBy: userId,
        });

        // Emit specific task status change event if status was updated
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (taskData.status !== undefined && (existingTask as any).status !== task.status) {
          this.taskSocket.emitTaskUpdateToAll('task_status_changed', {
            id: task.id,
            title: task.title,
            status: task.status,
            previousStatus: existingTask.status,
            changedBy: userId,
            changedAt: task.updatedAt,
          });
        }

        // Send email notification if task is completed
        if (task.status === 'Completed' && existingTask.status !== 'Completed') {
          await this.emailService.sendTaskCompletedEmail(taskData);
        }
      } catch (error) {
        console.error('Failed to send task update notifications:', error);
        // Don't fail the task update if notifications fail
      }

      return task;
    } catch (error) {
      throw new Error(
        `Task update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
