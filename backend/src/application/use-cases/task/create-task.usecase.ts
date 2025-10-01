import { ITaskRepository } from '../../../domain/repositories/task.repository';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { TaskRepositoryImpl } from '../../../infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../../infrastructure/repositories/user.repository.impl';
import { CreateTaskDto } from '../../dtos/task.dto';
import { TaskService } from '../../services/task.service';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../../../infrastructure/config/env';

export class CreateTaskUseCase {
  private taskService: TaskService;

  constructor(taskRepository?: ITaskRepository, userRepository?: IUserRepository) {
    const taskRepo = taskRepository ?? new TaskRepositoryImpl();
    const userRepo = userRepository ?? new UserRepositoryImpl();
    this.taskService = new TaskService(taskRepo, userRepo);
  }

  async execute(
    taskData: CreateTaskDto,
    userId: string,
    files?: Express.Multer.File[]
  ): Promise<{
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: Date;
    assignedTo: string;
    userId: string;
    priority: string;
    tags: string[];
    attachments: string[];
  }> {
    try {
      // Handle file uploads if provided
      const attachmentUrls: string[] = taskData.attachments ?? [];

      // Create the task first to get the actual task ID
      const task = await this.taskService.createTaskWithAttachments(
        taskData.title,
        taskData.description,
        new Date(taskData.dueDate),
        userId,
        taskData.assignedTo,
        taskData.priority ?? 'Medium',
        taskData.tags ?? [],
        attachmentUrls // Start with existing attachment URLs
      );

      // Handle file uploads if provided and move to correct folder structure
      if (files && files.length > 0) {
        const uploadDir = env.uploadDir;
        const taskUploadDir = path.join(uploadDir, 'tasks', userId, task.id);

        // Ensure upload directory exists
        fs.mkdirSync(taskUploadDir, { recursive: true });

        const updatedAttachmentUrls: string[] = [];

        for (const file of files) {
          const fileName = file.filename; // Multer already generated unique filename
          const tempFilePath = file.path;
          const finalFilePath = path.join(taskUploadDir, fileName);

          // Move file from temp location to final location
          fs.renameSync(tempFilePath, finalFilePath);

          updatedAttachmentUrls.push(fileName);
        }

        // Update task with correct attachment URLs
        const allAttachmentUrls = [...attachmentUrls, ...updatedAttachmentUrls];
        const updatedTask = new (task.constructor as any)(
          task.id,
          task.title,
          task.description,
          task.status,
          task.dueDate,
          task.userId,
          task.assignedTo,
          task.createdAt,
          new Date(),
          task.completedAt,
          allAttachmentUrls,
          task.priority,
          task.tags
        );

        // Save the updated task with correct attachment URLs
        await this.taskService['taskRepository'].update(task.id, updatedTask);

        // Update the return object with correct attachment URLs
        (task as any).attachments = allAttachmentUrls;
      }

      return {
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
      };
    } catch (error) {
      throw new Error(
        `Task creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
