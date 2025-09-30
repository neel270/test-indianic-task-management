// Common multer configuration for file uploads
import fs from 'fs';
import multer from 'multer';
import path from 'path';

// Storage configuration for profile images
export const profileImageStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/';
    const userId = req.user?.id;

    if (!userId) {
      return cb(new Error('User ID not found'), '');
    }

    const userProfileDir = path.join(uploadDir, 'profiles', userId);

    // Create directory if it doesn't exist
    fs.mkdirSync(userProfileDir, { recursive: true });

    cb(null, userProfileDir);
  },
  filename: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-profile';
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// Storage configuration for task files
export const taskFileStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads/';
    const userId = req.user?.id;
    const taskId = req.params.id;

    if (!userId) {
      return cb(new Error('User ID not found'), '');
    }

    if (!taskId) {
      return cb(new Error('Task ID not found'), '');
    }

    const taskFileDir = path.join(uploadDir, 'tasks', userId, taskId);

    // Create directory if it doesn't exist
    fs.mkdirSync(taskFileDir, { recursive: true });

    cb(null, taskFileDir);
  },
  filename: (req: any, file: any, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-task';
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  }
});

// File filter for images
export const imageFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow only image files
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WebP images are allowed.'));
  }
};

// File filter for documents
export const documentFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common document and image types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDF, Word documents, and text files are allowed.'));
  }
};

// Multer upload configurations
export const profileImageUpload = multer({
  storage: profileImageStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_PROFILE_IMAGE_SIZE || '5242880') // 5MB default
  },
  fileFilter: imageFileFilter
});

export const taskFileUpload = multer({
  storage: taskFileStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_TASK_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: documentFileFilter
});

// Memory storage for files that need processing (like image resizing)
export const memoryStorage = multer.memoryStorage();

export const memoryUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_MEMORY_FILE_SIZE || '10485760') // 10MB default
  }
});

// Helper function to delete uploaded file
export const deleteUploadedFile = (filePath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return resolve();
    }

    fs.unlink(filePath, (error) => {
      if (error) {
        console.error('Error deleting file:', error);
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

// Helper function to get file extension from mimetype
export const getFileExtension = (mimetype: string): string => {
  const mimeToExt: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'application/rtf': '.rtf'
  };

  return mimeToExt[mimetype] || '.bin';
};
