import { TaskEntity } from '../../../domain/entities/task.entity';
import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { UpdateTaskDto } from '../../dtos/task.dto';
import { TaskService } from '../../services/task.service';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../../../infrastructure/config/env';

export class UpdateTaskUseCase {
  private taskService: TaskService;

  constructor(taskRepository?: ITaskRepository, userRepository?: IUserRepository) {
    const taskRepo = taskRepository ?? new TaskRepositoryImpl();
    const userRepo = userRepository ?? new UserRepositoryImpl();
    this.taskService = new TaskService(taskRepo, userRepo);
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

      return task;
    } catch (error) {
      throw new Error(
        `Task update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
