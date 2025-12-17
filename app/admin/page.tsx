"use client";

import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { APIHOST } from '../common';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({
    identifier: '',
    password: ''
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${APIHOST}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.identifier,
          password: credentials.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Authentication failed');
      }

      const data: AuthResponse = await response.json();
      
      // Store JWT token in localStorage
      localStorage.setItem('adminToken', data.jwt);
      
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Tab content components
  const StatsTab = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Statistics Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Registration statistics and analytics will be displayed here.
      </Typography>
    </Paper>
  );

  const OrdersTab = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        View and manage all conference registrations and orders.
      </Typography>
    </Paper>
  );

  const ConferencesTab = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Conference Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage conferences, hotels, and conference-hotel relationships.
      </Typography>
    </Paper>
  );

  const ExportsTab = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Exports
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Export registration data, reports, and analytics.
      </Typography>
    </Paper>
  );

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
        
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Statistics" />
            <Tab label="Orders" />
            <Tab label="Conferences" />
            <Tab label="Exports" />
          </Tabs>
        </Paper>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && <StatsTab />}
          {activeTab === 1 && <OrdersTab />}
          {activeTab === 2 && <ConferencesTab />}
          {activeTab === 3 && <ExportsTab />}
        </Box>
      </Container>
    </Box>
  );
}