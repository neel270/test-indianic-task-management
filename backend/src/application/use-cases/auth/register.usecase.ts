import { CreateUserDto } from '../../dtos/user.dto';
import { AuthService } from '../../services/auth.service';

export class RegisterUseCase {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async execute(
    userData: CreateUserDto
  ): Promise<{ id: string; email: string; firstName: string; lastName: string }> {
    try {
      const user = await this.authService.registerUser(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName,
        userData.role ?? 'user'
      );

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch (error) {
      throw new Error(
        `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
