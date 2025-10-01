import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

import authSlice from './slices/authSlice';
import storage from 'redux-persist/lib/storage';

/**
 * Creating persist and setting key, and data
 */
const persistConfig = {
  key: 'task-management-front',
  storage,
  blacklist: [],
};
const rootReducer = combineReducers({
  auth: authSlice,
});
/**
 * Setting data from reducers to persist in local storage
 */
const persistedReducer = persistReducer(persistConfig, rootReducer);
/**
 * Configuring store so we can use it later in our APP
 */
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: { trace: true, traceLimit: 60 },
});
// getting persist data from persistStore
const persistor = persistStore(store);
export { persistor, store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
