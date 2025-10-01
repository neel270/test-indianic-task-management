import * as Yup from 'yup';

// Auth validation schemas
export const loginValidationSchema = Yup.object({
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Full name is required'),
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const forgotPasswordValidationSchema = Yup.object({
  email: Yup.string().email('Please enter a valid email address').required('Email is required'),
});

export const otpValidationSchema = Yup.object({
  otp: Yup.string()
    .length(6, 'OTP must be exactly 6 digits')
    .matches(/^\d{6}$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

export const setPasswordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

// Task validation schemas
export const taskValidationSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .required('Task title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .required('Task description is required'),
  dueDate: Yup.date()
    .min(new Date(), 'Due date cannot be in the past')
    .required('Due date is required'),
});

export const taskUpdateValidationSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .required('Task title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters')
    .required('Task description is required'),
  dueDate: Yup.date().required('Due date is required'),
  status: Yup.string()
    .oneOf(['Pending', 'Completed'], 'Status must be either Pending or Completed')
    .required('Status is required'),
});

// Profile validation schemas
export const profileImageValidationSchema = Yup.object({
  profileImage: Yup.mixed()
    .required('Please select an image')
    .test('fileType', 'Only image files are allowed (JPG, JPEG, PNG, WebP)', value => {
      if (!value) {
        return false;
      }
      const file = value as File;
      return file && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
    })
    .test('fileSize', 'Image size must be less than 5MB', value => {
      if (!value) {
        return false;
      }
      const file = value as File;
      return file && file.size <= 5 * 1024 * 1024; // 5MB
    }),
});

export const changePasswordValidationSchema = Yup.object({
  oldPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .notOneOf([Yup.ref('oldPassword')], 'New password must be different from current password')
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

// File upload validation
export const taskFileValidationSchema = Yup.object({
  file: Yup.mixed()
    .required('Please select a file')
    .test('fileType', 'Only PDF, DOCX, and image files are allowed', value => {
      if (!value) {
        return false;
      }
      const file = value as File;
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ];
      return file && allowedTypes.includes(file.type);
    })
    .test('fileSize', 'File size must be less than 10MB', value => {
      if (!value) {
        return false;
      }
      const file = value as File;
      return file && file.size <= 10 * 1024 * 1024; // 10MB
    }),
});

// Search and filter validation
export const taskFilterValidationSchema = Yup.object({
  search: Yup.string().max(100, 'Search term must be less than 100 characters'),
  status: Yup.string().oneOf(['all', 'pending', 'completed'], 'Invalid status filter'),
  startDate: Yup.date().nullable(),
  endDate: Yup.date()
    .nullable()
    .when('startDate', (startDate, schema) => {
      return startDate ? schema.min(startDate, 'End date must be after start date') : schema;
    }),
});

// Form field helpers
export const getFieldError = (
  formik: { touched: Record<string, boolean>; errors: Record<string, string> },
  fieldName: string
): string | undefined => {
  return formik.touched[fieldName] && formik.errors[fieldName]
    ? formik.errors[fieldName]
    : undefined;
};

export const isFieldInvalid = (
  formik: { touched: Record<string, boolean>; errors: Record<string, string> },
  fieldName: string
): boolean => {
  return !!(formik.touched[fieldName] && formik.errors[fieldName]);
};

// Common validation messages
export const ValidationMessages = {
  required: (field: string) => `${field} is required`,
  email: 'Please enter a valid email address',
  minLength: (field: string, length: number) => `${field} must be at least ${length} characters`,
  maxLength: (field: string, length: number) => `${field} must be less than ${length} characters`,
  passwordMatch: 'Passwords must match',
  invalidFile: 'Invalid file type or size',
  futureDate: 'Date must be in the future',
  pastDate: 'Date cannot be in the past',
};
