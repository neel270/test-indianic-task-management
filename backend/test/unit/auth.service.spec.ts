import { AuthService } from '../../src/application/services/auth.service';
import { UserEntity } from '../../src/domain/entities/user.entity';
import { Email } from '../../src/domain/value-objects/email.vo';
import { TaskRepositoryImpl } from '../../src/infrastructure/repositories/task.repository.impl';
import { UserRepositoryImpl } from '../../src/infrastructure/repositories/user.repository.impl';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: UserRepositoryImpl;
  let taskRepository: TaskRepositoryImpl;

  beforeEach(() => {
    userRepository = new UserRepositoryImpl();
    taskRepository = new TaskRepositoryImpl();
    authService = new AuthService(userRepository, taskRepository);
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const name = 'Test User';

      // Mock the repository save method
      jest.spyOn(userRepository, 'save').mockResolvedValue(
        UserEntity.create({
          name,
          email,
          password: 'hashed-password',
          role: 'user',
          isActive: true
        })
      );

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      const result = await authService.registerUser(email, password, name);

      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.name).toBe(name);
    });

    it('should throw error if user already exists', async () => {
      const email = 'existing@example.com';
      const emailVo = Email.create(email);

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(
        UserEntity.create({
          name: 'Existing User',
          email,
          password: 'hashed-password',
          role: 'user',
          isActive: true
        })
      );

      await expect(authService.registerUser(email, 'password123', 'Test User'))
        .rejects.toThrow('User already exists with this email');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = 'hashed-password';

      const user = UserEntity.create({
        name: 'Test User',
        email,
        password: hashedPassword,
        role: 'user',
        isActive: true
      });

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(user);

      // Mock bcrypt compare
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.loginUser(email, password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      const email = 'test@example.com';

      jest.spyOn(userRepository, 'findByEmail').mockResolvedValue(null);

      await expect(authService.loginUser(email, 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', async () => {
      const payload = { userId: '123', email: 'test@example.com', role: 'user' };
      const token = 'valid-token';

      // Mock jwt verify
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockReturnValue(payload);

      const result = await authService.verifyAccessToken(token);

      expect(result).toEqual(payload);
    });

    it('should throw error for invalid token', async () => {
      const token = 'invalid-token';

      // Mock jwt verify to throw error
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.verifyAccessToken(token))
        .rejects.toThrow('Invalid access token');
    });
  });
});
