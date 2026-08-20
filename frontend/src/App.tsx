import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './app/providers/queryProvider';
import { AuthProvider } from './services/auth/auth.context';
import { SocketProvider } from './services/socket/SocketContext';
import { router } from './app/router';
import './index.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <RouterProvider router={router} />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
