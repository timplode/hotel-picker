"use client";

import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import { APIHOST } from '../../common';
import { Conference } from '../../types/conference';

interface ConferenceDetailProps {
  conferenceId: string;
}

export default function ConferenceDetail({ conferenceId }: ConferenceDetailProps) {
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (conferenceId) {
      fetchConference();
    }
  }, [conferenceId]);

  const fetchConference = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${APIHOST}/api/conferences/${conferenceId}?populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conference details');
      }

      const data = await response.json();
      setConference(data.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conference details');
      console.error('Conference detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConferenceStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { label: 'Upcoming', color: 'primary' as const };
    if (now >= start && now <= end) return { label: 'Active', color: 'success' as const };
    return { label: 'Completed', color: 'default' as const };
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">Loading conference details...</Typography>
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

  if (!conference) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning">Conference not found</Alert>
      </Paper>
    );
  }

  const status = getConferenceStatus(conference.defaultArrivalDate, conference.defaultDepartureDate);

  return (
    <Box>
      {/* Header Section */}
      <Paper sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          {conference.logo && (
            <Avatar
              src={conference.logo.url}
              alt={conference.logo.alternativeText || conference.longName}
              sx={{ width: 80, height: 80 }}
            />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {conference.longName}
              </Typography>
              <Chip 
                label={status.label}
                color={status.color}
                size="medium"
              />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {conference.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Conference ID: {conference.documentId}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Details Grid */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Conference Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Conference Dates
                </Typography>
                <Typography variant="body1">
                  {formatDate(conference.defaultArrivalDate)} - {formatDate(conference.defaultDepartureDate)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Earliest Arrival
                </Typography>
                <Typography variant="body1">
                  {formatDate(conference.earliestArrivalDate)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Logins Allowed
                </Typography>
                <Chip 
                  label={conference.allowLogins ? 'Yes' : 'No'}
                  color={conference.allowLogins ? 'success' : 'error'}
                  size="small"
                />
              </Box>

              {conference.passcode && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Access Passcode
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {conference.passcode}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(conference.createdAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(conference.updatedAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Published
                </Typography>
                <Typography variant="body1">
                  {formatDateTime(conference.publishedAt)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Internal ID
                </Typography>
                <Typography variant="body1" fontFamily="monospace">
                  #{conference.id}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Logo Information */}
        {conference.logo && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Conference Logo
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} alignItems="center">
                  <Grid>
                    <Avatar
                      src={conference.logo.url}
                      alt={conference.logo.alternativeText || conference.longName}
                      sx={{ width: 120, height: 120 }}
                      variant="rounded"
                    />
                  </Grid>
                  <Grid>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        File Name
                      </Typography>
                      <Typography variant="body1">
                        {conference.logo.name}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Dimensions
                      </Typography>
                      <Typography variant="body1">
                        {conference.logo.width} × {conference.logo.height} pixels
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        File Size
                      </Typography>
                      <Typography variant="body1">
                        {(conference.logo.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>

                    {conference.logo.alternativeText && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Alt Text
                        </Typography>
                        <Typography variant="body1">
                          {conference.logo.alternativeText}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}