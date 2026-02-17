import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount (for persistence across page reloads)
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAccessToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    }
    
    // Mark loading as complete
    setIsLoading(false);
  }, []);

  const setAuth = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    // Store in localStorage for persistence
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('id'); // Remove old id field if exists
  };

  const isAuthenticated = !!accessToken && !!user;

  return (
    <AuthContext.Provider value={{ user, accessToken, setAuth, clearAuth, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
