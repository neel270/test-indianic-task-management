import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

// Providers
import { QueryProvider } from './providers/QueryProvider';
import { ReduxProvider } from './providers/ReduxProvider';

// Routes and Layouts
import AppRoutes from './routes/AppRoutes';

// Auth utilities
import { isAuthenticated } from './hooks/useAuth';
import { useAppDispatch } from './store/hooks';
import { loadUserProfile } from './store/slices/authSlice';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const authenticated = isAuthenticated();

  useEffect(() => {
    // Load user profile if token exists
    if (authenticated) {
      dispatch(loadUserProfile());
    }
  }, [authenticated, dispatch]);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRoutes />
    </TooltipProvider>
  );
};

const App: React.FC = () => {
  return (
    <ReduxProvider>
      <QueryProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryProvider>
    </ReduxProvider>
  );
};

export default App;
