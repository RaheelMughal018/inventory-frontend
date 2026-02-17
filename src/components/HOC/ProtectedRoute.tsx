import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; 
    return Date.now() >= expiryTime;
  } catch (error) {
    // If token is malformed, consider it expired
    console.log(error)
    return true;
  }
};

const ProtectedRoute = () => {
  const { accessToken, isAuthenticated, clearAuth, isLoading } = useAuth();

  // Wait for auth state to load from localStorage
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if user is authenticated and token is not expired
  if (!isAuthenticated || !accessToken || isTokenExpired(accessToken)) {
    // Clear expired/invalid auth data
    clearAuth();
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;