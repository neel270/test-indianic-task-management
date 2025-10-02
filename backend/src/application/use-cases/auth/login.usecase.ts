import { LoginUserDto } from '../../dtos/user.dto';
import { AuthService } from '../../services/auth.service';

export class LoginUseCase {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async execute(loginData: LoginUserDto): Promise<{
    user: { id: string; email: string; firstName: string; lastName: string; role: string };
    tokens: { accessToken: string; refreshToken: string };
  }> {
    try {
      const result = await this.authService.loginUser(loginData.email, loginData.password);

      return result;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
