import { Outlet } from 'react-router-dom';
import { useAuth } from '../../services/auth/auth.context';
import { ROLES } from '../../constants';

function RootLayout() {
  const { auth } = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  return <Outlet />;
}

export default RootLayout;
