import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '@/lib/api';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/');
    }
  }, [navigate]);
  
  return <>{children}</>;
}
