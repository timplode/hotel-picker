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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { APIHOST } from '../../common';
import { Conference } from '../../types/conference';
import { ConferenceHotelRoom, ConferenceHotelRoomResponse } from '../../types/conferenceHotelRoom';
import { Hotel } from '../../types/hotel';

interface ConferenceDetailProps {
  conferenceId: string;
}

export default function ConferenceDetail({ conferenceId }: ConferenceDetailProps) {
  const [conference, setConference] = useState<Conference | null>(null);
  const [rooms, setRooms] = useState<ConferenceHotelRoom[]>([]);
  const [conferenceHotels, setConferenceHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomsError, setRoomsError] = useState('');
  const [showRooms, setShowRooms] = useState(false);
  const [showAddRoomDialog, setShowAddRoomDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dailyRate: '',
    blockTotal: '',
    maxOccupants: '',
    conference_hotel: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [showAddHotelDialog, setShowAddHotelDialog] = useState(false);
  const [hotelDialogTab, setHotelDialogTab] = useState(0);
  const [availableHotels, setAvailableHotels] = useState<Hotel[]>([]);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [newHotelData, setNewHotelData] = useState({
    name: '',
    longName: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
    website: '',
    amenities: '',
    contactName: '',
    contactEmail: ''
  });
  const [hotelFormLoading, setHotelFormLoading] = useState(false);
  const [hotelFormError, setHotelFormError] = useState('');

  useEffect(() => {
    if (conferenceId) {
      fetchConference();
      fetchConferenceRooms();
      fetchConferenceHotels();
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

  const fetchConferenceRooms = async () => {
    try {
      setRoomsLoading(true);
      setRoomsError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch conference hotel rooms for this conference
      const response = await fetch(
        `${APIHOST}/api/conference-hotel-rooms?filters[conference_hotel][conference][documentId][$eq]=${conferenceId}&populate=conference_hotel.hotel&sort=name:asc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conference rooms');
      }

      const data: ConferenceHotelRoomResponse = await response.json();
      setRooms(data.data || []);

    } catch (err) {
      setRoomsError(err instanceof Error ? err.message : 'Failed to load conference rooms');
      console.error('Conference rooms error:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchConferenceHotels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(
        `${APIHOST}/api/conference-hotels?filters[conference][documentId][$eq]=${conferenceId}&populate=hotel&sort=priority:asc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConferenceHotels(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching conference hotels:', err);
    }
  };

  const fetchAvailableHotels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(
        `${APIHOST}/api/hotels?sort=longName:asc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const allHotels = data.data || [];
        
        // Filter out hotels already associated with this conference
        const existingHotelIds = conferenceHotels.map(ch => ch.hotel.documentId);
        const available = allHotels.filter(hotel => !existingHotelIds.includes(hotel.documentId));
        setAvailableHotels(available);
      }
    } catch (err) {
      console.error('Error fetching available hotels:', err);
    }
  };

  const handleAddExistingHotels = async () => {
    try {
      setHotelFormLoading(true);
      setHotelFormError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (selectedHotels.length === 0) {
        throw new Error('Please select at least one hotel');
      }

      // Create conference-hotel associations for each selected hotel
      const promises = selectedHotels.map(hotelId => 
        fetch(`${APIHOST}/api/conference-hotels`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              conference: conferenceId,
              hotel: hotelId,
              priority: 0
            }
          })
        })
      );

      const responses = await Promise.all(promises);
      const failedRequests = responses.filter(r => !r.ok);
      
      if (failedRequests.length > 0) {
        throw new Error(`Failed to add ${failedRequests.length} hotel(s)`);
      }

      // Reset and refresh
      setSelectedHotels([]);
      setShowAddHotelDialog(false);
      await Promise.all([fetchConferenceHotels(), fetchConferenceRooms()]);

    } catch (err) {
      setHotelFormError(err instanceof Error ? err.message : 'Failed to add hotels');
    } finally {
      setHotelFormLoading(false);
    }
  };

  const handleCreateNewHotel = async () => {
    try {
      setHotelFormLoading(true);
      setHotelFormError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!newHotelData.name || !newHotelData.longName) {
        throw new Error('Hotel name and full name are required');
      }

      // First create the hotel
      const hotelResponse = await fetch(`${APIHOST}/api/hotels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            name: newHotelData.name,
            longName: newHotelData.longName,
            addressCity: newHotelData.addressCity || null,
            addressState: newHotelData.addressState || null,
            addressZip: newHotelData.addressZip || null,
            website: newHotelData.website || null,
            amenities: newHotelData.amenities || null,
            contactName: newHotelData.contactName || null,
            contactEmail: newHotelData.contactEmail || null
          }
        })
      });

      if (!hotelResponse.ok) {
        throw new Error('Failed to create hotel');
      }

      const hotelData = await hotelResponse.json();

      // Then associate it with the conference
      const conferenceHotelResponse = await fetch(`${APIHOST}/api/conference-hotels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            conference: conferenceId,
            hotel: hotelData.data.documentId,
            priority: 0
          }
        })
      });

      if (!conferenceHotelResponse.ok) {
        throw new Error('Failed to associate hotel with conference');
      }

      // Reset and refresh
      setNewHotelData({
        name: '',
        longName: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
        website: '',
        amenities: '',
        contactName: '',
        contactEmail: ''
      });
      setShowAddHotelDialog(false);
      await Promise.all([fetchConferenceHotels(), fetchConferenceRooms()]);

    } catch (err) {
      setHotelFormError(err instanceof Error ? err.message : 'Failed to create hotel');
    } finally {
      setHotelFormLoading(false);
    }
  };

  const handleCloseHotelDialog = () => {
    setShowAddHotelDialog(false);
    setHotelDialogTab(0);
    setHotelFormError('');
    setSelectedHotels([]);
    setNewHotelData({
      name: '',
      longName: '',
      addressCity: '',
      addressState: '',
      addressZip: '',
      website: '',
      amenities: '',
      contactName: '',
      contactEmail: ''
    });
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
      if (!formData.name || !formData.dailyRate || !formData.blockTotal || !formData.conference_hotel) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch(
        `${APIHOST}/api/conference-hotel-rooms`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              name: formData.name,
              dailyRate: parseFloat(formData.dailyRate),
              blockTotal: parseInt(formData.blockTotal),
              maxOccupants: formData.maxOccupants ? parseInt(formData.maxOccupants) : null,
              conference_hotel: formData.conference_hotel
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      // Reset form and close dialog
      setFormData({
        name: '',
        dailyRate: '',
        blockTotal: '',
        maxOccupants: '',
        conference_hotel: ''
      });
      setShowAddRoomDialog(false);
      
      // Refresh rooms list
      await fetchConferenceRooms();

    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseDialog = () => {
    setShowAddRoomDialog(false);
    setFormError('');
    setFormData({
      name: '',
      dailyRate: '',
      blockTotal: '',
      maxOccupants: '',
      conference_hotel: ''
    });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

      {/* Conference Hotels Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Conference Hotels ({conferenceHotels.length})
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              setShowAddHotelDialog(true);
              fetchAvailableHotels();
            }}
          >
            Manage Hotels
          </Button>
        </Box>

        {conferenceHotels.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No hotels associated with this conference
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {conferenceHotels.map((conferenceHotel) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={conferenceHotel.documentId}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {conferenceHotel.hotel.longName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {conferenceHotel.hotel.name}
                    </Typography>
                    
                    {(conferenceHotel.hotel.addressCity || conferenceHotel.hotel.addressState) && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {[conferenceHotel.hotel.addressCity, conferenceHotel.hotel.addressState].filter(Boolean).join(', ')}
                        {conferenceHotel.hotel.addressZip && ` ${conferenceHotel.hotel.addressZip}`}
                      </Typography>
                    )}
                    
                    {conferenceHotel.hotel.website && (
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <a href={conferenceHotel.hotel.website} target="_blank" rel="noopener noreferrer">
                          Website
                        </a>
                      </Typography>
                    )}
                    
                    {conferenceHotel.hotel.amenities && (
                      <Typography variant="body2" color="text.secondary">
                        {conferenceHotel.hotel.amenities}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Available Rooms Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Available Hotel Rooms ({rooms.length})
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setShowAddRoomDialog(true)}
              disabled={conferenceHotels.length === 0}
            >
              Add Hotel Room
            </Button>
          </Box>
        </Box>

        
          {roomsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading rooms...
              </Typography>
            </Box>
          )}

          {roomsError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {roomsError}
            </Alert>
          )}

          {!roomsLoading && !roomsError && rooms.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No rooms found for this conference
            </Typography>
          )}

          {!roomsLoading && !roomsError && rooms.length > 0 && (
            <Box>
              {(() => {
                // Group rooms by hotel
                const roomsByHotel = rooms.reduce((acc, room) => {
                  const hotelKey = room.conference_hotel?.documentId || 'unknown';
                  const hotelName = room.conference_hotel?.hotel?.longName || room.conference_hotel?.hotel?.name || 'Unknown Hotel';
                  
                  if (!acc[hotelKey]) {
                    acc[hotelKey] = {
                      name: hotelName,
                      rooms: []
                    };
                  }
                  acc[hotelKey].rooms.push(room);
                  return acc;
                }, {} as Record<string, { name: string; rooms: ConferenceHotelRoom[] }>);

                return Object.entries(roomsByHotel).map(([hotelKey, hotelGroup]) => (
                  <Box key={hotelKey} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                      {hotelGroup.name} ({hotelGroup.rooms.length} rooms)
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Room Name</strong></TableCell>
                            <TableCell align="right"><strong>Daily Rate</strong></TableCell>
                            <TableCell align="center"><strong>Block Total</strong></TableCell>
                            <TableCell align="center"><strong>Max Occupants</strong></TableCell>
                            <TableCell align="center"><strong>Images</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {hotelGroup.rooms.map((room) => (
                            <TableRow key={room.documentId} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {room.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium" color="success.main">
                                  {formatCurrency(room.dailyRate)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  per night
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={room.blockTotal}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {room.maxOccupants || 'N/A'}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {room.pics && room.pics.length > 0 ? (
                                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                    {room.pics.slice(0, 3).map((pic, index) => (
                                      <Avatar
                                        key={pic.id}
                                        src={pic.url}
                                        alt={pic.alternativeText || room.name}
                                        sx={{ width: 32, height: 32 }}
                                        variant="rounded"
                                      />
                                    ))}
                                    {room.pics.length > 3 && (
                                      <Chip
                                        label={`+${room.pics.length - 3}`}
                                        size="small"
                                        sx={{ height: 32, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No images
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ));
              })()}
            </Box>
          )}
       
      </Paper>

      {/* Manage Hotels Dialog */}
      <Dialog 
        open={showAddHotelDialog} 
        onClose={handleCloseHotelDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Manage Conference Hotels</DialogTitle>
        <DialogContent>
          {hotelFormError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {hotelFormError}
            </Alert>
          )}
          
          <Tabs value={hotelDialogTab} onChange={(e, newValue) => setHotelDialogTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Add Existing Hotels" />
            <Tab label="Create New Hotel" />
          </Tabs>

          {hotelDialogTab === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select existing hotels to add to this conference:
              </Typography>
              
              {availableHotels.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  No available hotels found or all hotels are already associated with this conference
                </Typography>
              ) : (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {availableHotels.map((hotel) => (
                    <ListItem key={hotel.documentId} disablePadding>
                      <ListItemButton 
                        onClick={() => {
                          setSelectedHotels(prev => 
                            prev.includes(hotel.documentId)
                              ? prev.filter(id => id !== hotel.documentId)
                              : [...prev, hotel.documentId]
                          );
                        }}
                      >
                        <Checkbox
                          checked={selectedHotels.includes(hotel.documentId)}
                          sx={{ mr: 2 }}
                        />
                        <ListItemText
                          primary={hotel.longName}
                          secondary={[
                            hotel.addressCity,
                            hotel.addressState
                          ].filter(Boolean).join(', ')}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {hotelDialogTab === 1 && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Hotel Name (Short)"
                    value={newHotelData.name}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, name: e.target.value }))}
                    fullWidth
                    required
                    placeholder="e.g., Marriott Downtown"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Hotel Name (Full)"
                    value={newHotelData.longName}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, longName: e.target.value }))}
                    fullWidth
                    required
                    placeholder="e.g., Downtown Marriott Hotel & Convention Center"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="City"
                    value={newHotelData.addressCity}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, addressCity: e.target.value }))}
                    fullWidth
                    placeholder="e.g., San Francisco"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="State"
                    value={newHotelData.addressState}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, addressState: e.target.value }))}
                    fullWidth
                    placeholder="e.g., CA"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    label="ZIP Code"
                    value={newHotelData.addressZip}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, addressZip: e.target.value }))}
                    fullWidth
                    placeholder="e.g., 94102"
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Website"
                    value={newHotelData.website}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, website: e.target.value }))}
                    fullWidth
                    placeholder="https://www.hotel-website.com"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Contact Name"
                    value={newHotelData.contactName}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, contactName: e.target.value }))}
                    fullWidth
                    placeholder="e.g., John Smith"
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Contact Email"
                    type="email"
                    value={newHotelData.contactEmail}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    fullWidth
                    placeholder="contact@hotel.com"
                  />
                </Grid>
                
                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Amenities"
                    value={newHotelData.amenities}
                    onChange={(e) => setNewHotelData(prev => ({ ...prev, amenities: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="e.g., Pool, Fitness Center, Business Center, Free WiFi"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHotelDialog} disabled={hotelFormLoading}>
            Cancel
          </Button>
          {hotelDialogTab === 0 ? (
            <Button 
              onClick={handleAddExistingHotels} 
              variant="contained" 
              disabled={hotelFormLoading || selectedHotels.length === 0}
            >
              {hotelFormLoading ? <CircularProgress size={20} /> : `Add Selected Hotels (${selectedHotels.length})`}
            </Button>
          ) : (
            <Button 
              onClick={handleCreateNewHotel} 
              variant="contained" 
              disabled={hotelFormLoading || !newHotelData.name || !newHotelData.longName}
            >
              {hotelFormLoading ? <CircularProgress size={20} /> : 'Create & Add Hotel'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog 
        open={showAddRoomDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Hotel Room</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Hotel</InputLabel>
              <Select
                value={formData.conference_hotel}
                onChange={(e) => handleFormChange('conference_hotel', e.target.value)}
                label="Select Hotel"
              >
                {conferenceHotels.map((hotel) => (
                  <MenuItem key={hotel.documentId} value={hotel.documentId}>
                    {hotel.hotel.longName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Room Name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              fullWidth
              required
              placeholder="e.g., Standard Double Room"
            />

            <TextField
              label="Daily Rate"
              type="number"
              value={formData.dailyRate}
              onChange={(e) => handleFormChange('dailyRate', e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                step: 0.01
              }}
              placeholder="0.00"
            />

            <TextField
              label="Block Total"
              type="number"
              value={formData.blockTotal}
              onChange={(e) => handleFormChange('blockTotal', e.target.value)}
              fullWidth
              required
              inputProps={{
                min: 1
              }}
              placeholder="Number of rooms available"
              helperText="Total number of rooms in this block"
            />

            <TextField
              label="Max Occupants"
              type="number"
              value={formData.maxOccupants}
              onChange={(e) => handleFormChange('maxOccupants', e.target.value)}
              fullWidth
              inputProps={{
                min: 1
              }}
              placeholder="Optional"
              helperText="Maximum number of people per room (optional)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleFormSubmit} 
            variant="contained" 
            disabled={formLoading || !formData.name || !formData.dailyRate || !formData.blockTotal || !formData.conference_hotel}
          >
            {formLoading ? <CircularProgress size={20} /> : 'Add Room'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}