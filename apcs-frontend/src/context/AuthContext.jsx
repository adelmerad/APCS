import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('apcs_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Simple role detection based on email
    let role = 'carrier';
    let name = 'User';

    if (email.includes('admin')) {
      role = 'admin';
      name = 'Admin User';
    } else if (email.includes('operator')) {
      role = 'operator';
      name = 'Operator User';
    } else {
      role = 'carrier';
      name = 'Carrier User';
    }

    const userData = {
      email,
      name,
      role,
    };

    localStorage.setItem('apcs_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('apcs_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator',
    isCarrier: user?.role === 'carrier',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
