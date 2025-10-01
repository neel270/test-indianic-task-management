import { TaskEntity } from '../../../domain/entities';

export interface TaskModel {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  dueDate: Date;
  userId: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  attachments?: string;
  priority: 'Low' | 'Medium' | 'High';
  tags?: string;
}

export class TaskModelMapper {
  static toDomain(model: TaskModel): TaskEntity {
    console.log('Mapping TaskModel to TaskEntity:', model);
    return new TaskEntity(
      model.id,
      model.title,
      model.description,
      model.status,
      model.dueDate,
      model.userId,
      model.assignedTo,
      model.createdAt,
      model.updatedAt,
      model.completedAt,
      model.attachments ? JSON.parse(model.attachments) : [],
      model.priority,
      model.tags ? JSON.parse(model.tags) : []
    );
  }

  static toDomainFromMongoose(mongooseDoc: any): TaskEntity {
    // Handle populated userId - extract ObjectId if it's a populated document
    const userId = mongooseDoc.userId?._id ?
      mongooseDoc.userId._id.toString() :
      mongooseDoc.userId?.toString() || mongooseDoc.userId;

    // Handle populated assignedTo - extract ObjectId if it's a populated document
    const assignedTo = mongooseDoc.assignedTo?._id ?
      mongooseDoc.assignedTo._id.toString() :
      mongooseDoc.assignedTo?.toString() || mongooseDoc.assignedTo;

    return new TaskEntity(
      mongooseDoc.id || mongooseDoc._id?.toString(),
      mongooseDoc.title,
      mongooseDoc.description,
      mongooseDoc.status,
      mongooseDoc.dueDate,
      userId,
      assignedTo,
      mongooseDoc.createdAt,
      mongooseDoc.updatedAt,
      mongooseDoc.completedAt,
      mongooseDoc.attachments || [],
      mongooseDoc.priority,
      mongooseDoc.tags || []
    );
  }

  static toPersistence(domain: TaskEntity): TaskModel {
    console.log('Mapping TaskEntity to TaskModel:', domain);
    return {
      id: domain.id,
      title: domain.title,
      description: domain.description,
      status: domain.status,
      dueDate: domain.dueDate,
      userId: domain.userId,
      assignedTo: domain.assignedTo,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
      completedAt: domain.completedAt,
      attachments: JSON.stringify(domain.attachments),
      priority: domain.priority,
      tags: JSON.stringify(domain.tags)
    };
  }
}
