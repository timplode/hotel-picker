"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Chip,
  Button,
  TableSortLabel,
  TablePagination
} from '@mui/material';
import { APIHOST } from '../../common';
import { Conference } from '../../types/conference';

type SortOrder = 'asc' | 'desc';

export default function Conferences() {
  const router = useRouter();
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Conference>('createdAt');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchConferences();
  }, [page, rowsPerPage, orderBy, order]);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${APIHOST}/api/conferences?sort=${orderBy}:${order}&pagination[page]=${page + 1}&pagination[pageSize]=${rowsPerPage}&populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conferences');
      }

      const data = await response.json();
      setConferences(data.data || []);
      setTotal(data.meta?.pagination?.total || 0);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conferences');
      console.error('Conferences error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property: keyof Conference) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0); // Reset to first page when sorting changes
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getConferenceStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return { label: 'Upcoming', color: 'primary' as const };
    if (now >= start && now <= end) return { label: 'Active', color: 'success' as const };
    return { label: 'Completed', color: 'default' as const };
  };

  const handleConferenceClick = (conferenceId: string) => {
    router.push(`/admin/conferences/${conferenceId}`);
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">Loading conferences...</Typography>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Conference Management
        </Typography>
        <Button variant="contained" color="primary">
          Add Conference
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'longName'}
                  direction={orderBy === 'longName' ? order : 'asc'}
                  onClick={() => handleRequestSort('longName')}
                >
                  Conference Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'defaultArrivalDate'}
                  direction={orderBy === 'defaultArrivalDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('defaultArrivalDate')}
                >
                  Start Date
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'defaultDepartureDate'}
                  direction={orderBy === 'defaultDepartureDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('defaultDepartureDate')}
                >
                  End Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conferences.map((conference) => {
              const status = getConferenceStatus(conference.defaultArrivalDate, conference.defaultDepartureDate);
              return (
                <TableRow 
                  key={conference.documentId} 
                  hover
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => handleConferenceClick(conference.documentId)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {conference.longName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(conference.defaultArrivalDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(conference.defaultDepartureDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={status.label}
                      color={status.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => handleConferenceClick(conference.documentId)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {conferences.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No conferences found
          </Typography>
        </Box>
      )}
    </Paper>
  );
}