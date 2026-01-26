import { Navigate, Outlet } from 'react-router';

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
  const token = localStorage.getItem('access_token');

  // Check if token exists and is not expired
  if (!token || isTokenExpired(token)) {
    // Remove expired token from localStorage
    localStorage.removeItem('access_token');
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;