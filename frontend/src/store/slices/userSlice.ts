import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserService, User, CreateUserRequest, UpdateUserRequest, PaginationParams, PaginatedResponse, UserFilters } from '@/services/api';
import { toast } from 'sonner';

// Types
interface UserState {
  users: User[];
  currentUser: User | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: UserFilters;
  isLoading: boolean;
  error: string | null;
  stats: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    users: number;
  } | null;
}

// Initial state
const initialState: UserState = {
  users: [],
  currentUser: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  isLoading: false,
  error: null,
  stats: null,
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: PaginationParams & UserFilters = {}, { rejectWithValue }) => {
    try {
      const response = await UserService.getUsers(params);
      return response;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = await UserService.getUserById(id);
      return user;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: CreateUserRequest, { rejectWithValue }) => {
    try {
      const user = await UserService.createUser(userData);
      return user;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: string; userData: UpdateUserRequest }, { rejectWithValue }) => {
    try {
      const user = await UserService.updateUser(id, userData);
      return user;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await UserService.deleteUser(id);
      return id;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to delete user');
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = await UserService.toggleUserStatus(id);
      return user;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to toggle user status');
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'users/fetchUserStats',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await UserService.getUserStats();
      return stats;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message || 'Failed to fetch user statistics');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.pagination = initialState.pagination;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users cases
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Fetch user by ID cases
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Create user cases
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
        state.error = null;
        toast.success('User created successfully!');
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
        toast.success('User updated successfully!');
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Delete user cases
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.pagination.total -= 1;
        state.error = null;
        toast.success('User deleted successfully!');
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Toggle user status cases
      .addCase(toggleUserStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
        toast.success(`User ${action.payload.isActive ? 'activated' : 'deactivated'} successfully!`);
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      })

      // Fetch user stats cases
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        toast.error(action.payload as string);
      });
  },
});

// Export actions
export const { clearUsers, clearError, setFilters, clearFilters, setPage } = userSlice.actions;

// Export reducer
export default userSlice.reducer;

// Selectors
export const selectUsers = (state: { users: UserState }) => state.users.users;
export const selectCurrentUser = (state: { users: UserState }) => state.users.currentUser;
export const selectUserPagination = (state: { users: UserState }) => state.users.pagination;
export const selectUserFilters = (state: { users: UserState }) => state.users.filters;
export const selectUsersLoading = (state: { users: UserState }) => state.users.isLoading;
export const selectUsersError = (state: { users: UserState }) => state.users.error;
export const selectUserStats = (state: { users: UserState }) => state.users.stats;