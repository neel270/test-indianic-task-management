import { TaskEntity } from '../../domain/entities/task.entity';
import { ITaskRepository, TaskFilters } from '../../domain/repositories/task.repository';
import { TaskModelMapper } from '../database/models/task.model';
import { TaskSchema } from '../database/schemas/task.schema';

export class TaskRepositoryImpl implements ITaskRepository {
  private repository: typeof TaskSchema;

  constructor() {
    this.repository = TaskSchema;
  }

  async save(task: TaskEntity): Promise<TaskEntity> {
    const modelData = TaskModelMapper.toPersistence(task);
    const savedModel = await this.repository.create(modelData);
    const savedDocument = await savedModel.save();
    return TaskModelMapper.toDomainFromMongoose(savedDocument.toObject());
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const model = await this.repository.findById(id).populate('userId');
    return model ? TaskModelMapper.toDomainFromMongoose(model.toObject()) : null;
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ tasks: TaskEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    const [models, total] = await Promise.all([
      this.repository
        .find({ userId })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('userId'),
      this.repository.countDocuments({ userId }),
    ]);
    return {
      tasks: models.map(model => TaskModelMapper.toDomainFromMongoose(model.toObject())),
      total,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: TaskFilters
  ): Promise<{ tasks: TaskEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.priority) {
      query.priority = filters.priority;
    }

    if (filters?.startDate || filters?.endDate) {
      query.dueDate = {};
      if (filters.startDate) {
        query.dueDate.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.dueDate.$lte = filters.endDate;
      }
    }
    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const [models, total] = await Promise.all([
      this.repository
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('userId'),
      this.repository.countDocuments(query),
    ]);

    return {
      tasks: models.map(model => TaskModelMapper.toDomainFromMongoose(model.toObject())),
      total,
    };
  }

  async update(id: string, task: Partial<TaskEntity>): Promise<TaskEntity> {
    const modelData = TaskModelMapper.toPersistence(task as any);
    const updatedModel = await this.repository
      .findByIdAndUpdate(
        id,
        { ...modelData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
      .populate('userId');
    if (!updatedModel) {
      throw new Error('Task not found');
    }
    return TaskModelMapper.toDomainFromMongoose(updatedModel.toObject());
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.findByIdAndDelete(id);
    return !!result;
  }

  async findOverdueTasks(): Promise<TaskEntity[]> {
    const now = new Date();
    const models = await this.repository
      .find({
        status: 'Pending',
        dueDate: { $lt: now },
      })
      .populate('userId');

    return models.map(model => TaskModelMapper.toDomainFromMongoose(model.toObject()));
  }

  async findTasksDueSoon(hoursThreshold: number = 24): Promise<TaskEntity[]> {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() + hoursThreshold);

    const models = await this.repository
      .find({
        status: 'Pending',
        dueDate: { $lte: thresholdDate, $gt: now },
      })
      .populate('userId');

    return models.map(model => TaskModelMapper.toDomainFromMongoose(model.toObject()));
  }

  async findByStatus(status: 'Pending' | 'Completed'): Promise<TaskEntity[]> {
    const models = await this.repository.find({ status }).populate('userId');
    return models.map(model => TaskModelMapper.toDomainFromMongoose(model.toObject()));
  }
}
