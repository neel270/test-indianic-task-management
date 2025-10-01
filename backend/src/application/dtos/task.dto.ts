// Task DTOs for validation schemas
export interface CreateTaskDto {
  title: string;
  description: string;
  dueDate: string; // ISO date string for validation
  assignedTo: string;
  status?: 'Pending' | 'Completed';
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedTo?: string;
  dueDate?: string; // ISO date string for validation
  priority?: 'Low' | 'Medium' | 'High';
  tags?: string[];
}

export interface TaskFiltersDto {
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
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
   status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface UploadTaskFileDto {
  file: string; // This will be handled by multer
}
