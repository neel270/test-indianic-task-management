import { UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository, UserFilters } from '../../domain/repositories/user.repository';
import { Email } from '../../domain/value-objects/email.vo';
import { UserModelMapper } from '../database/models/user.model';
import { UserSchema } from '../database/schemas/user.schema';

export class UserRepositoryImpl implements IUserRepository {
  private repository: typeof UserSchema;

  constructor() {
    this.repository = UserSchema;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const modelData = UserModelMapper.toPersistence(user);
    const savedModel = await this.repository.create(modelData);
    const savedDocument = await savedModel.save();
    return UserModelMapper.toDomainFromMongoose(savedDocument.toObject());
  }

  async findById(id: string): Promise<UserEntity | null> {
    const model = await this.repository.findById(id);
    return model ? UserModelMapper.toDomainFromMongoose(model.toObject()) : null;
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    const model = await this.repository.findOne({ email: email.getValue() });
    return model ? UserModelMapper.toDomainFromMongoose(model.toObject()) : null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: UserFilters
  ): Promise<{ users: UserEntity[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (filters?.role) {
      query.role = filters.role;
    }
    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }
    const [models, total] = await Promise.all([
      this.repository.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.repository.countDocuments(query),
    ]);
    return {
      users: models.map(model => UserModelMapper.toDomainFromMongoose(model.toObject())),
      total,
    };
  }

  async findByRole(role: 'admin' | 'user'): Promise<UserEntity[]> {
    const models = await this.repository.find({ role });
    return models.map(model => UserModelMapper.toDomainFromMongoose(model.toObject()));
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    const modelData = UserModelMapper.toPersistence(user as any);
    const updatedModel = await this.repository.findByIdAndUpdate(
      id,
      { ...modelData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!updatedModel) {
      throw new Error('User not found');
    }
    return UserModelMapper.toDomainFromMongoose(updatedModel.toObject());
  }

  async updateProfileImage(id: string, profileImage: string): Promise<UserEntity> {
    const updatedModel = await this.repository.findByIdAndUpdate(
      id,
      { profileImage, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!updatedModel) {
      throw new Error('User not found');
    }
    return UserModelMapper.toDomainFromMongoose(updatedModel.toObject());
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.findByIdAndDelete(id);
    return !!result;
  }

  async exists(email: Email): Promise<boolean> {
    const count = await this.repository.countDocuments({ email: email.getValue() });
    return count > 0;
  }
}
