import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { AuthGuard } from '../AuthGuard';

export const AppLayout = () => {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </AuthGuard>
  );
};
