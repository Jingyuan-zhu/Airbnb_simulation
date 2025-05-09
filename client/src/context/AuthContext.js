import React, { createContext, useState, useEffect, useContext } from 'react';
import config from '../config.json';

// Create the authentication context
export const AuthContext = createContext();

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const serverUrl = `http://${config.server_host}:${config.server_port}`;

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${serverUrl}/auth/user`, {
          credentials: 'include' // Important for sending cookies
        });
        const data = await response.json();
        
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [serverUrl]);

  // Function to handle logout
  const logout = async () => {
    try {
      await fetch(`${serverUrl}/auth/logout`, {
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Value to be provided to consumers
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 