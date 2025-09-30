import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import tasksReducer from '../store/slices/tasksSlice';
import userReducer from '../store/slices/userSlice';

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  tasks: tasksReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
