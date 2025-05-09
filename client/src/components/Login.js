import React from 'react';
import { Box, Button, Typography, Card, CardContent, Stack } from '@mui/material';
import config from '../config.json';

// Login component with social login buttons
const Login = () => {
  // Build the server URL from the config
  const serverUrl = `http://${config.server_host}:${config.server_port}`;

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
        
        <Typography variant="body2" color="text.secondary" paragraph align="center">
          Connect with your favorite social account to access all features
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            fullWidth
            sx={{ 
              bgcolor: '#DB4437', 
              '&:hover': { bgcolor: '#B73229' },
              py: 1
            }}
            href={`${serverUrl}/auth/google`}
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
            href={`${serverUrl}/auth/twitter`}
          >
            Login with Twitter
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default Login; 