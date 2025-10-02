import { UserEntity } from '../../../domain/entities';
import { env } from '../../config/env';

export interface UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  isActive: boolean;
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserModelMapper {
  static toDomain(model: UserModel): UserEntity {
    return new UserEntity(
      model.id,
      model.firstName,
      model.lastName,
      model.email,
      model.password,
      model.role,
      model.isActive,
      model.profileImage,
      model.createdAt,
      model.updatedAt
    );
  }

  static toDomainFromMongoose(mongooseDoc: any): UserEntity {
    const profileImage = mongooseDoc.profileImage
      ? `${env.baseUrl}/uploads/profiles/${mongooseDoc.id ?? mongooseDoc._id?.toString()}/${
          mongooseDoc.profileImage
        }`
      : mongooseDoc.profileImage;
    return new UserEntity(
      mongooseDoc.id ?? mongooseDoc._id?.toString(),
      mongooseDoc.firstName,
      mongooseDoc.lastName,
      mongooseDoc.email,
      mongooseDoc.password,
      mongooseDoc.role,
      mongooseDoc.isActive,
      profileImage,
      mongooseDoc.createdAt,
      mongooseDoc.updatedAt
    );
  }

  static toPersistence(domain: UserEntity): UserModel {
    return {
      id: domain.id,
      firstName: domain.firstName,
      lastName: domain.lastName,
      email: domain.email,
      password: domain.password,
      role: domain.role,
      isActive: domain.isActive,
      profileImage: domain.profileImage,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }
}
