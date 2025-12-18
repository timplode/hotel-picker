"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import { APIHOST } from '../common';
import AdminTabs from './components/AdminTabs';
import Summary from './components/Summary';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  jwt: string;
  user: User;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false || !!localStorage.getItem('adminToken'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${APIHOST}/api/auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: credentials.identifier,
          password: credentials.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Authentication failed');
      }

      const data: AuthResponse = await response.json();
      console.log('Login successful:', data.jwt);
      // Store JWT token in localStorage
      localStorage.setItem('adminToken', data.jwt);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    setIsAuthenticated(false);
    setCredentials({ identifier: '', password: '' });
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };



  // Login Form
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4, display: 'flex', alignItems: 'center' }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Admin Login
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Username or Email"
                  value={credentials.identifier}
                  onChange={handleInputChange('identifier')}
                  required
                  disabled={loading}
                />
                
                <TextField
                  fullWidth
                  type="password"
                  label="Password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  required
                  disabled={loading}
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading || !credentials.identifier || !credentials.password}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Admin Dashboard (after authentication)
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Admin Dashboard
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        
        <Alert severity="success" sx={{ mb: 3 }}>
          Welcome back, {user?.username || user?.email}!
        </Alert>
        
        <AdminTabs currentPath="/admin" />
        
        <Box sx={{ mt: 3 }}>
          <Summary />
        </Box>
      </Container>
    </Box>
  );
}