// Task DTOs for validation schemas
export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate: string; // ISO date string for validation
  status?: 'Pending' | 'Completed';
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'Pending' | 'Completed';
  dueDate?: string; // ISO date string for validation
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
}

export interface TaskFiltersDto {
  status?: 'Pending' | 'Completed';
  startDate?: string; // ISO date string for validation
  endDate?: string; // ISO date string for validation
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TaskIdDto {
  id: string;
}

export interface TaskStatusDto {
  status: 'Pending' | 'Completed';
}

export interface UploadTaskFileDto {
  file: string; // This will be handled by multer
}
