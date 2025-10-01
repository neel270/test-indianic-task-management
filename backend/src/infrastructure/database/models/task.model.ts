import { env } from '../../config';
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
  attachments?: string[];
  priority: 'Low' | 'Medium' | 'High';
  tags?: string[];
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
      model.attachments ?? [],
      model.priority,
      model.tags ?? []
    );
  }
  static toDomainFromMongoose(mongooseDoc: any): TaskEntity {
    // Handle populated userId - extract ObjectId if it's a populated document
    let userId = mongooseDoc.userId?._id ? mongooseDoc.userId._id.toString() : null;
    userId = userId ?? (mongooseDoc.userId ? mongooseDoc.userId.toString() : null);
    // Handle populated assignedTo - extract ObjectId if it's a populated document
    let assignedTo = mongooseDoc.assignedTo?._id ? mongooseDoc.assignedTo._id.toString() : null;
    assignedTo = assignedTo ?? (mongooseDoc.assignedTo ? mongooseDoc.assignedTo.toString() : null);
    let attachments = Array.isArray(mongooseDoc.attachments) ? mongooseDoc.attachments : [];
    attachments = attachments.map((attachment: string | null) => {
      const fileUrl = `${env.baseUrl}/uploads/tasks/${userId}/${
        mongooseDoc.id ?? mongooseDoc._id?.toString()
      }/${attachment}`;
      return fileUrl;
    });
    console.log('Mapping Mongoose Document to TaskEntity:', mongooseDoc);
    console.log('Extracted userId:', userId);
    console.log('Extracted assignedTo:', assignedTo);
    console.log('Extracted attachments:', attachments);
    return new TaskEntity(
      mongooseDoc.id ?? mongooseDoc._id?.toString(),
      mongooseDoc.title,
      mongooseDoc.description,
      mongooseDoc.status,
      mongooseDoc.dueDate,
      userId,
      assignedTo,
      mongooseDoc.createdAt,
      mongooseDoc.updatedAt,
      mongooseDoc.completedAt,
      attachments,
      mongooseDoc.priority,
      mongooseDoc.tags ?? []
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
      attachments: domain.attachments,
      priority: domain.priority,
      tags: domain.tags,
    };
  }
}
