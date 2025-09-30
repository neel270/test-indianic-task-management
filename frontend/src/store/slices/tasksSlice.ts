import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

// Task API interface
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Completed';
  dueDate: string;
  file?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  };
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string;
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'Pending' | 'Completed';
  dueDate?: string;
}

interface FetchTasksParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// API Service
class TaskApiService {
  private static baseUrl = '/api/tasks';
  
  private static async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  static async getTasks(params: FetchTasksParams = {}): Promise<{ success: boolean; data: { data: Task[]; pagination: any } }> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    return this.request(`?${searchParams}`);
  }
  
  static async createTask(taskData: CreateTaskRequest): Promise<{ success: boolean; data: Task }> {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }
  
  static async updateTask(id: string, updates: UpdateTaskRequest): Promise<{ success: boolean; data: Task }> {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
  
  static async deleteTask(id: string): Promise<{ success: boolean }> {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

// Types
interface TasksState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  selectedTask: Task | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// Initial state
const initialState: TasksState = {
  tasks: [],
  isLoading: false,
  error: null,
  selectedTask: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
  }
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: FetchTasksParams, { rejectWithValue }) => {
    try {
      const response = await TaskApiService.getTasks(params);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskRequest, { rejectWithValue }) => {
    try {
      const response = await TaskApiService.createTask(taskData);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, updates }: { id: string; updates: UpdateTaskRequest }, { rejectWithValue }) => {
    try {
      const response = await TaskApiService.updateTask(id, updates);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await TaskApiService.deleteTask(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to delete task');
    }
  }
);

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    clearTasks: (state) => {
      state.tasks = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks cases
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Create task cases
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Update task cases
      .addCase(updateTask.pending, (state) => {
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask?.id === action.payload.id) {
          state.selectedTask = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Delete task cases
      .addCase(deleteTask.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask = null;
        }
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { clearError, setSelectedTask, clearTasks } = tasksSlice.actions;

// Export reducer
export default tasksSlice.reducer;

// Selectors
export const selectTasks = (state: { tasks: TasksState }) => state.tasks.tasks;
export const selectTasksLoading = (state: { tasks: TasksState }) => state.tasks.isLoading;
export const selectTasksError = (state: { tasks: TasksState }) => state.tasks.error;
export const selectSelectedTask = (state: { tasks: TasksState }) => state.tasks.selectedTask;
export const selectTasksPagination = (state: { tasks: TasksState }) => state.tasks.pagination;
