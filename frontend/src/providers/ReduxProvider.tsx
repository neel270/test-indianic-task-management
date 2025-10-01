import React from 'react';
import { Provider } from 'react-redux';
import { persistor, store } from '../store/index';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { setAuthToken } from '@/lib/axios';

interface ReduxProviderProps {
  children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  const handleOnBeforeLift = () => {
    if (store.getState().auth.token !== undefined && store.getState().auth.token !== null) {
      setAuthToken(String(store.getState().auth.token));
    }
  };
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor} onBeforeLift={handleOnBeforeLift}>
        {children}
      </PersistGate>
    </Provider>
  );
};
