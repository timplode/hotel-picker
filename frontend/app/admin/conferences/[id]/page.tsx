"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import AdminTabs from '../../components/AdminTabs';
import ConferenceDetail from '../../components/ConferenceDetail'

export default function ConferenceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const conferenceId = params.id as string;

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      router.push('/admin');
    }
    setLoading(false);
  }, [router]);

  const handleBackToConferences = () => {
    router.push('/admin/conferences');
  };

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

        <AdminTabs currentPath="/admin/conferences" />
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleBackToConferences}
            sx={{ mb: 3 }}
          >
            ← Back to Conferences
          </Button>
          
          <ConferenceDetail conferenceId={conferenceId} />
        </Box>
      </Container>
    </Box>
  );
}