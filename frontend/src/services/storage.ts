// Storage service for localStorage operations with type safety

export interface StorageData {
  accessToken?: string;
  refreshToken?: string;
  user?: any;
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  tasksView?: 'list' | 'grid' | 'kanban';
  sidebarCollapsed?: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  TASKS_VIEW: 'tasksView',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
} as const;

// Generic storage functions
export const storage = {
  // Get item from localStorage
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  },

  // Set item in localStorage
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error);
    }
  },

  // Remove item from localStorage
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  },

  // Clear all localStorage
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage', error);
    }
  },

  // Check if key exists
  exists: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },
};

// Authentication specific storage functions
export const authStorage = {
  getAccessToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN);
  },

  setAccessToken: (token: string): void => {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getRefreshToken: (): string | null => {
    return storage.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken: (token: string): void => {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  getUser: (): any | null => {
    return storage.get<any>(STORAGE_KEYS.USER);
  },

  setUser: (user: any): void => {
    storage.set(STORAGE_KEYS.USER, user);
  },

  clearAuth: (): void => {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },

  isAuthenticated: (): boolean => {
    return !!(storage.get<string>(STORAGE_KEYS.ACCESS_TOKEN) && storage.get<any>(STORAGE_KEYS.USER));
  },
};

// Theme storage functions
export const themeStorage = {
  getTheme: (): 'light' | 'dark' | 'system' => {
    return storage.get<'light' | 'dark' | 'system'>(STORAGE_KEYS.THEME) || 'system';
  },

  setTheme: (theme: 'light' | 'dark' | 'system'): void => {
    storage.set(STORAGE_KEYS.THEME, theme);
  },
};

// UI preferences storage functions
export const uiStorage = {
  getTasksView: (): 'list' | 'grid' | 'kanban' => {
    return storage.get<'list' | 'grid' | 'kanban'>(STORAGE_KEYS.TASKS_VIEW) || 'list';
  },

  setTasksView: (view: 'list' | 'grid' | 'kanban'): void => {
    storage.set(STORAGE_KEYS.TASKS_VIEW, view);
  },

  getSidebarCollapsed: (): boolean => {
    return storage.get<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED) || false;
  },

  setSidebarCollapsed: (collapsed: boolean): void => {
    storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
  },

  getLanguage: (): string => {
    return storage.get<string>(STORAGE_KEYS.LANGUAGE) || 'en';
  },

  setLanguage: (language: string): void => {
    storage.set(STORAGE_KEYS.LANGUAGE, language);
  },
};

// Task-specific storage functions
export const taskStorage = {
  getFilters: (): Record<string, any> | null => {
    return storage.get<Record<string, any>>('taskFilters');
  },

  setFilters: (filters: Record<string, any>): void => {
    storage.set('taskFilters', filters);
  },

  getSortPreference: (): string | null => {
    return storage.get<string>('taskSort');
  },

  setSortPreference: (sort: string): void => {
    storage.set('taskSort', sort);
  },

  clearTaskPreferences: (): void => {
    storage.remove('taskFilters');
    storage.remove('taskSort');
  },
};

// Export all storage functions
export const storageService = {
  storage,
  auth: authStorage,
  theme: themeStorage,
  ui: uiStorage,
  tasks: taskStorage,
};

export default storageService;
