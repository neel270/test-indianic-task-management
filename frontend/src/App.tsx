import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Providers
import { QueryProvider } from './providers/QueryProvider';
import { ReduxProvider } from './providers/ReduxProvider';
import { SocketProvider } from './contexts/SocketContext';

// Routes and Layouts
import AppRoutes from './routes/AppRoutes';

const AppContent: React.FC = () => {


  return (
    <SocketProvider>
      <TooltipProvider>
        <Toaster />
        <AppRoutes />
      </TooltipProvider>
    </SocketProvider>
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
