import { UserEntity } from '../../../domain/entities';

export interface UserModel {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  is_active: boolean;
  profile_image?: string;
  created_at: Date;
  updated_at: Date;
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
      model.is_active,
      model.profile_image,
      model.created_at,
      model.updated_at
    );
  }

  static toDomainFromMongoose(mongooseDoc: any): UserEntity {
    return new UserEntity(
      mongooseDoc.id || mongooseDoc._id?.toString(),
      mongooseDoc.firstName,
      mongooseDoc.lastName,
      mongooseDoc.email,
      mongooseDoc.password,
      mongooseDoc.role,
      mongooseDoc.isActive,
      mongooseDoc.profileImage,
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
      is_active: domain.isActive,
      profile_image: domain.profileImage,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }
}
