"use client";

import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { APIHOST } from '../common';

interface Conference {
  id: number;
  documentId: string;
  longName: string;
  startDate: string;
  endDate: string;
}

interface ConferenceStats {
  conference: Conference;
  orderCount: number;
}

export default function Statistics() {
  const [stats, setStats] = useState<ConferenceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch conferences
      const conferencesResponse = await fetch(`${APIHOST}/api/conferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!conferencesResponse.ok) {
        throw new Error('Failed to fetch conferences');
      }

      const conferencesData = await conferencesResponse.json();
      const conferences = conferencesData.data || [];

      // Fetch order counts for each conference
      const statsPromises = conferences.map(async (conference: Conference) => {
        try {
          const ordersResponse = await fetch(
            `${APIHOST}/api/orders?filters[conference][documentId][$eq]=${conference.documentId}&pagination[pageSize]=1`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (!ordersResponse.ok) {
            console.warn(`Failed to fetch orders for conference ${conference.documentId}`);
            return { conference, orderCount: 0 };
          }

          const ordersData = await ordersResponse.json();
          const orderCount = ordersData.meta?.pagination?.total || 0;

          return { conference, orderCount };
        } catch (err) {
          console.warn(`Error fetching orders for conference ${conference.documentId}:`, err);
          return { conference, orderCount: 0 };
        }
      });

      const conferenceStats = await Promise.all(statsPromises);
      setStats(conferenceStats);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
      console.error('Statistics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalOrders = () => {
    return stats.reduce((total, stat) => total + stat.orderCount, 0);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">Loading statistics...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Conference Statistics
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="div" color="primary">
          {getTotalOrders()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total Orders Across All Conferences
        </Typography>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Conference</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="right">Orders</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.conference.documentId}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {stat.conference.longName}
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDate(stat.conference.defaultArrivalDate)}
                </TableCell>
                <TableCell>
                  {formatDate(stat.conference.defaultDepartureDate)}
                </TableCell>
                <TableCell align="right">
                  <Chip 
                    label={stat.orderCount} 
                    color={stat.orderCount > 0 ? "primary" : "default"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {stats.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No conferences found
          </Typography>
        </Box>
      )}
    </Paper>
  );
}