import { LoginUserDto } from '../dtos/user.dto';

export interface ILoginUserUseCase {
  execute(
    credentials: LoginUserDto
  ): Promise<{ accessToken: string; refreshToken: string; user: any }>;
}
