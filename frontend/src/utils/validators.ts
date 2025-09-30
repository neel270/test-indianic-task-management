import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email('Invalid email address');

// Password validation schema (minimum 8 characters, at least one uppercase, one lowercase, one number)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// User validation schema
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name must be less than 50 characters'),
  email: emailSchema,
  role: z.enum(['admin', 'user', 'manager'], {
    errorMap: () => ({ message: 'Role must be admin, user, or manager' })
  }),
  isActive: z.boolean().optional()
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Registration validation schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(50, 'Name must be less than 50 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};

export const validateUser = (user: unknown) => {
  return userSchema.safeParse(user);
};

export const validateLogin = (credentials: unknown) => {
  return loginSchema.safeParse(credentials);
};

export const validateRegistration = (userData: unknown) => {
  return registerSchema.safeParse(userData);
};