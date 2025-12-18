"use client";

import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { APIHOST } from '../../common';

interface ExportOption {
  title: string;
  description: string;
  endpoint: string;
  filename: string;
}

export default function Exports() {
  const [loading, setLoading] = useState<string | null>(null);

  const exportOptions: ExportOption[] = [
    {
      title: 'Orders Export',
      description: 'Export all orders with guest information and booking details',
      endpoint: '/api/orders',
      filename: 'orders-export.csv'
    },
    {
      title: 'Conferences Export',
      description: 'Export all conferences with dates and details',
      endpoint: '/api/conferences',
      filename: 'conferences-export.csv'
    },
    {
      title: 'Statistics Report',
      description: 'Export registration statistics and analytics',
      endpoint: '/api/statistics',
      filename: 'statistics-report.csv'
    },
    {
      title: 'Hotel Bookings',
      description: 'Export hotel bookings by conference',
      endpoint: '/api/hotel-bookings',
      filename: 'hotel-bookings.csv'
    }
  ];

  const handleExport = async (option: ExportOption) => {
    try {
      setLoading(option.title);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${APIHOST}${option.endpoint}?format=csv`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = option.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Export error:', err);
      // Could add proper error handling/toast here
    } finally {
      setLoading(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Data Exports
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Export registration data, reports, and analytics in CSV format
      </Typography>

      <Grid container spacing={3}>
        {exportOptions.map((option, index) => (
          <Grid xs={12} md={6} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
              
              <Divider />
              
              <CardActions sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport(option)}
                  disabled={loading === option.title}
                  fullWidth
                >
                  {loading === option.title ? 'Exporting...' : 'Export'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> All exports are in CSV format and include data based on your current permissions.
        </Typography>
      </Box>
    </Paper>
  );
}