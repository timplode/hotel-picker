"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert
} from '@mui/material';
import AdminTabs from '../components/AdminTabs';
import Orders from '../components/Orders';

export default function OrdersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      // Redirect to admin login if not authenticated
      router.push('/admin');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="warning">
          Please log in to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h3" component="h1">
            Admin Dashboard
          </Typography>
          <Button variant="outlined" onClick={() => {
            localStorage.removeItem('adminToken');
            router.push('/admin');
          }}>
            Logout
          </Button>
        </Box>

        <AdminTabs currentPath="/admin/orders" />
        
        <Box sx={{ mt: 3 }}>
          <Orders />
        </Box>
      </Container>
    </Box>
  );
}