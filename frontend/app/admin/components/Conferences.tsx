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
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Grid,
  InputAdornment
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    longName: '',
    defaultArrivalDate: '',
    defaultDepartureDate: '',
    earliestArrivalDate: '',
    allowLogins: false,
    passcode: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

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

  const handleFormSubmit = async () => {
    try {
      setFormLoading(true);
      setFormError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate required fields
      if (!formData.name || !formData.longName || !formData.defaultArrivalDate || !formData.defaultDepartureDate || !formData.earliestArrivalDate) {
        throw new Error('Please fill in all required fields');
      }

      // Validate dates
      const earliestArrival = new Date(formData.earliestArrivalDate);
      const defaultArrival = new Date(formData.defaultArrivalDate);
      const defaultDeparture = new Date(formData.defaultDepartureDate);

      if (earliestArrival > defaultArrival) {
        throw new Error('Earliest arrival date must be before default arrival date');
      }

      if (defaultArrival >= defaultDeparture) {
        throw new Error('Default departure date must be after default arrival date');
      }

      const response = await fetch(`${APIHOST}/api/conferences`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: formData.name,
            longName: formData.longName,
            defaultArrivalDate: formData.defaultArrivalDate,
            defaultDepartureDate: formData.defaultDepartureDate,
            earliestArrivalDate: formData.earliestArrivalDate,
            allowLogins: formData.allowLogins,
            passcode: formData.passcode || undefined
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create conference');
      }

      // Reset form and close dialog
      handleCloseDialog();
      
      // Refresh conferences list
      await fetchConferences();

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create conference');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setFormError('');
    setFormData({
      name: '',
      longName: '',
      defaultArrivalDate: '',
      defaultDepartureDate: '',
      earliestArrivalDate: '',
      allowLogins: false,
      passcode: ''
    });
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
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setShowAddDialog(true)}
        >
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

      {/* Add Conference Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Conference</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <Box sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Conference Name (Short)"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g., CONF2025"
                  helperText="Short identifier for the conference"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Conference Name (Full)"
                  value={formData.longName}
                  onChange={(e) => handleFormChange('longName', e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g., Annual Technology Conference 2025"
                  helperText="Full display name"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Earliest Arrival Date"
                  type="date"
                  value={formData.earliestArrivalDate}
                  onChange={(e) => handleFormChange('earliestArrivalDate', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Earliest date attendees can arrive"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Default Arrival Date"
                  type="date"
                  value={formData.defaultArrivalDate}
                  onChange={(e) => handleFormChange('defaultArrivalDate', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Conference start date"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Default Departure Date"
                  type="date"
                  value={formData.defaultDepartureDate}
                  onChange={(e) => handleFormChange('defaultDepartureDate', e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Conference end date"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Access Passcode"
                  value={formData.passcode}
                  onChange={(e) => handleFormChange('passcode', e.target.value)}
                  fullWidth
                  placeholder="Optional passcode for registration"
                  helperText="Leave empty if no passcode required"
                />
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allowLogins}
                        onChange={(e) => handleFormChange('allowLogins', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Allow User Logins"
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            disabled={formLoading || !formData.name || !formData.longName || !formData.defaultArrivalDate || !formData.defaultDepartureDate || !formData.earliestArrivalDate}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Create Conference'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}