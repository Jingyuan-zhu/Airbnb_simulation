import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Tabs, 
  Tab, 
  TextField, 
  Divider,
  Alert 
} from '@mui/material';
import config from '../config.json';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GoogleIcon from '@mui/icons-material/Google';
import TwitterIcon from '@mui/icons-material/Twitter';

// Login component with social login buttons and regular login/signup
const Login = () => {
  // Build the server URL from the config
  const serverUrl = `http://${config.server_host}:${config.server_port}`;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for tab management
  const [tabValue, setTabValue] = useState(0);
  
  // State for form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State for alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setSuccess('');
  };

  // Handle form submission for login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch(`${serverUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      
      setSuccess('Login successful!');
      
      // Short timeout to show success message before redirecting
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Force reload to update auth state
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await fetch(`${serverUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Signup failed');
        return;
      }
      
      setSuccess('Account created successfully!');
      
      // Short timeout to show success message before redirecting
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Force reload to update auth state
      }, 1000);
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = (provider) => {
    window.location.href = `${serverUrl}/auth/${provider}`;
  };

  // If user is already logged in, show a message
  if (user) {
    return (
      <Card 
        sx={{ 
          maxWidth: 400, 
          mx: 'auto', 
          mt: 4, 
          p: 2,
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom align="center">
            You are already logged in
          </Typography>
          <Typography paragraph align="center">
            Welcome, {user.displayName || user.username}
          </Typography>
          <Button 
            variant="contained" 
            fullWidth
            onClick={() => navigate('/')}
          >
            Go to Home
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        maxWidth: 400, 
        mx: 'auto', 
        mt: 4, 
        p: 2,
        boxShadow: 3,
        borderRadius: 2
      }}
    >
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Login or Sign Up
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 2 }}>
          <Tab label="Login" />
          <Tab label="Sign Up" />
        </Tabs>
        
        {tabValue === 0 && (
          <form onSubmit={handleLogin}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Button 
                variant="contained" 
                type="submit"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Stack>
          </form>
        )}
        
        {tabValue === 1 && (
          <form onSubmit={handleSignup}>
            <Stack spacing={2}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <Button 
                variant="contained" 
                type="submit"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </Stack>
          </form>
        )}
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
        
        <Typography variant="body2" color="text.secondary" paragraph align="center">
          Connect with your favorite social account
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              bgcolor: '#DB4437', 
              '&:hover': { bgcolor: '#B73229' },
              py: 1
            }}
            onClick={() => handleSocialLogin('google')}
            startIcon={<GoogleIcon />}
            disabled={loading}
          >
            Login with Google
          </Button>

          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              bgcolor: '#1DA1F2', 
              '&:hover': { bgcolor: '#1A91DA' },
              py: 1
            }}
            onClick={() => handleSocialLogin('twitter')}
            startIcon={<TwitterIcon />}
            disabled={loading}
          >
            Login with Twitter
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Login; 