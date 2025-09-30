import { CreateUserDto } from '@/application/dtos/user.dto';

/**
 * Create User Use Case Interface
 *
 * Defines the contract for creating new users in the system.
 * This interface follows the Clean Architecture pattern and implements
 * the Use Case layer for user creation business logic.
 *
 * The use case is responsible for:
 * - Validating user creation data
 * - Checking business rules (e.g., email uniqueness)
 * - Creating user entity
 * - Persisting user data
 * - Returning appropriate response
 */
export interface ICreateUserUseCase {
  /**
   * Execute the user creation use case
   *
   * @param userData - Validated user creation data transfer object
   * @returns Promise resolving to created user information
   *
   * @example
   * ```typescript
   * const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);
   * const result = await createUserUseCase.execute({
   *   name: 'John Doe',
   *   email: 'john.doe@example.com',
   *   password: 'securePassword123',
   *   role: 'user'
   * });
   * console.log('User created:', result.id);
   * ```
   */
  execute(userData: CreateUserDto): Promise<{ id: string; email: string; name: string }>;
}
