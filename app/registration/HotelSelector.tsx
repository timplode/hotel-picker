"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

import { Hotel, HotelResponse } from '../types/hotel';
import { Conference } from '../types/conference';
import { Order } from '../types/order';

interface HotelSelectorProps {
  conference: Conference | null;
  order: Order;
  setOrderProp: (field: string, value: any) => void;
}

export default function HotelSelector({ conference, order, setOrderProp }: HotelSelectorProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<string>(order.selectedHotel || '');
  const [expandedAmenities, setExpandedAmenities] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (conference?.documentId) {
      fetchHotels();
    }
  }, [conference]);

  const fetchHotels = async () => {
    if (!conference?.documentId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `http://localhost:1337/api/hotels?filters[hotel_conferences][conference][documentId][$eq]=${conference.documentId}&populate=*`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      
      const data: HotelResponse = await response.json();
      setHotels(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading hotels');
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelect = (hotelId: string) => {
    setSelectedHotel(hotelId);
    setOrderProp('selectedHotel', hotelId);
  };



  const formatPrice = (price: number | null | undefined) => {
    if (!price) return 'Contact for pricing';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatAmenities = (amenities: string | null | undefined) => {
    if (!amenities) return [];
    try {
      return typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
    } catch {
      return amenities.split(',').map(a => a.trim());
    }
  };

  const truncateAmenities = (amenities: string, maxLength: number = 60) => {
    if (amenities.length <= maxLength) return amenities;
    return amenities.substring(0, maxLength) + '...';
  };

  const toggleAmenitiesExpansion = (hotelId: string) => {
    setExpandedAmenities(prev => ({
      ...prev,
      [hotelId]: !prev[hotelId]
    }));
  };



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading available hotels...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!conference) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No conference selected. Please select a conference first.
      </Alert>
    );
  }

  if (hotels.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" gutterBottom>
          No Hotels Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are no hotels currently available for this conference.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
        Select Your Hotel
      </Typography>

      {/* Hotel Cards Grid */}
      <Grid container spacing={3}>
        {hotels.map((hotel) => (
          <Grid item xs={12} md={6} lg={4} key={hotel.documentId}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: selectedHotel === hotel.documentId ? 2 : 1,
                borderColor: selectedHotel === hotel.documentId ? 'primary.main' : 'grey.200',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={() => handleHotelSelect(hotel.documentId)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h4" gutterBottom>
                  {hotel.longName}
                </Typography>
                
                {hotel.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {hotel.description}
                  </Typography>
                )}

                {hotel.addressCity && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {hotel.addressCity && `${hotel.addressCity}`}
                    {hotel.addressState && `, ${hotel.addressState}`}
                    {hotel.addressZip && ` ${hotel.addressZip}`}
                  </Typography>
                )}

                {hotel.phone && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Phone:</strong> {hotel.phone}
                  </Typography>
                )}

                {hotel.email && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Email:</strong> {hotel.email}
                  </Typography>
                )}

                {hotel.website && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    <a href={hotel.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Typography>
                )}

                {hotel.amenities && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="600" gutterBottom>
                      Amenities:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {expandedAmenities[hotel.documentId] 
                        ? hotel.amenities 
                        : truncateAmenities(hotel.amenities)
                      }
                      {hotel.amenities.length > 60 && (
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAmenitiesExpansion(hotel.documentId);
                          }}
                          sx={{ 
                            ml: 1, 
                            minWidth: 'auto', 
                            p: 0,
                            textTransform: 'none',
                            fontSize: '0.75rem'
                          }}
                        >
                          {expandedAmenities[hotel.documentId] ? 'Show less' : 'Show more'}
                        </Button>
                      )}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <CardActions>
                <Button
                  variant={selectedHotel === hotel.documentId ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                  onClick={() => handleHotelSelect(hotel.documentId)}
                >
                  {selectedHotel === hotel.documentId ? "Selected" : "Select Hotel"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedHotel && (
        <Box sx={{ mt: 3, borderRadius: 1 }}>
          <Typography variant="body1" color="success.dark">
            ✓ Hotel selected
          </Typography>
        </Box>
      )}
    </Box>
  );
}