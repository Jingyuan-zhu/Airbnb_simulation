import React, { createContext, useState, useEffect, useContext } from 'react';
import config from '../config.json';

// Create the authentication context
export const AuthContext = createContext();

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const serverUrl = `http://${config.server_host}:${config.server_port}`;

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${serverUrl}/auth/user`, {
          credentials: 'include', // Important for sending cookies
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (!response.ok) {
          console.error('Auth check failed with status:', response.status);
          setUser(null);
          return;
        }
        
        const data = await response.json();
        
        if (data.authenticated) {
          console.log('User is authenticated:', data.user);
          setUser(data.user);
        } else {
          console.log('User is not authenticated');
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setError('Failed to check authentication status');
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
      setLoading(true);
      const response = await fetch(`${serverUrl}/auth/logout`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Logout request failed');
      }
      
      setUser(null);
      // Force page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh auth state
  const refreshAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/auth/user`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Value to be provided to consumers
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    refreshAuth
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