import { TaskEntity } from '@/domain/entities/task.entity';

export interface ITaskRepository {
  save(task: TaskEntity): Promise<TaskEntity>;
  findById(id: string): Promise<TaskEntity | null>;
  findByUserId(userId: string, page?: number, limit?: number): Promise<{ tasks: TaskEntity[]; total: number }>;
  findAll(page?: number, limit?: number, filters?: TaskFilters): Promise<{ tasks: TaskEntity[]; total: number }>;
  update(id: string, task: Partial<TaskEntity>): Promise<TaskEntity>;
  delete(id: string): Promise<boolean>;
  findOverdueTasks(): Promise<TaskEntity[]>;
  findTasksDueSoon(hoursThreshold?: number): Promise<TaskEntity[]>;
  findByStatus(status: 'Pending' | 'Completed'): Promise<TaskEntity[]>;
}

export interface TaskFilters {
  status?: 'Pending' | 'Completed';
  startDate?: Date;
  endDate?: Date;
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
}
