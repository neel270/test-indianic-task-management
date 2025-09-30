import { TaskEntity } from '@/domain/entities/task.entity';

export interface TaskModel {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  due_date: Date;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  attachments?: string;
  priority: 'Low' | 'Medium' | 'High';
  tags?: string;
}

export class TaskModelMapper {
  static toDomain(model: TaskModel): TaskEntity {
    return new TaskEntity(
      model.id,
      model.title,
      model.description,
      model.status,
      model.due_date,
      model.user_id,
      model.created_at,
      model.updated_at,
      model.completed_at,
      model.attachments ? JSON.parse(model.attachments) : [],
      model.priority,
      model.tags ? JSON.parse(model.tags) : []
    );
  }

  static toDomainFromMongoose(mongooseDoc: any): TaskEntity {
    return new TaskEntity(
      mongooseDoc.id || mongooseDoc._id?.toString(),
      mongooseDoc.title,
      mongooseDoc.description,
      mongooseDoc.status,
      mongooseDoc.dueDate,
      mongooseDoc.userId?.toString(),
      mongooseDoc.createdAt,
      mongooseDoc.updatedAt,
      mongooseDoc.completedAt,
      mongooseDoc.attachments || [],
      mongooseDoc.priority,
      mongooseDoc.tags || []
    );
  }

  static toPersistence(domain: TaskEntity): TaskModel {
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      status: domain.status,
      due_date: domain.dueDate,
      user_id: domain.userId,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
      completed_at: domain.completedAt,
      attachments: JSON.stringify(domain.attachments),
      priority: domain.priority,
      tags: JSON.stringify(domain.tags)
    };
  }
}
