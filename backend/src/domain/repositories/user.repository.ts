import { UserEntity } from '@/domain/entities/user.entity';
import { Email } from '@/domain/value-objects/email.vo';

export interface IUserRepository {
  save(user: UserEntity): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: Email): Promise<UserEntity | null>;
  findAll(page?: number, limit?: number): Promise<{ users: UserEntity[]; total: number }>;
  findByRole(role: 'admin' | 'user'): Promise<UserEntity[]>;
  update(id: string, user: Partial<UserEntity>): Promise<UserEntity>;
  updateProfileImage(id: string, profileImage: string): Promise<UserEntity>;
  delete(id: string): Promise<boolean>;
  exists(email: Email): Promise<boolean>;
}
