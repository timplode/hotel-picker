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
  Alert
} from '@mui/material';

import { ConferenceHotel, ConferenceHotelResponse } from '../types/conferenceHotel';
import { Conference } from '../types/conference';
import { Order } from '../types/order';
import { APIHOST } from '../common';

interface HotelSelectorProps {
  conference: Conference | null;
  order: Order;
  setOrderProp: (field: string, value: any) => void;
}

export default function HotelSelector({ conference, order, setOrderProp }: HotelSelectorProps) {
  const [hotels, setHotels] = useState<ConferenceHotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState<string>(order.selectedHotel || '');
  const [expandedAmenities, setExpandedAmenities] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (conference?.documentId) {
      fetchHotels();
    }
  }, [conference, order.requiresBusParking, order.requiresTransitToVenue]);

  const fetchHotels = async () => {
    if (!conference?.documentId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Build filter query with transportation requirements
      let filterQuery = `filters[conference][documentId][$eq]=${conference.documentId}`;
      
      if (order.requiresBusParking) {
        filterQuery += `&filters[hasBusParking][$eq]=true`;
      }
      
      if (order.requiresTransitToVenue) {
        filterQuery += `&filters[hasTransitToVenue][$eq]=true`;
      }
      
      const response = await fetch(
        `${APIHOST}/api/conference-hotels?${filterQuery}&populate=*&sort=priority:asc`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      
      const data: ConferenceHotelResponse = await response.json();
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
    console.log('Selected hotel ID:', hotelId);
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
        {hotels.map((conferenceHotel) => (
          <Grid size={{ xs: 6, md: 8 }} key={conferenceHotel.hotel.documentId}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: selectedHotel === conferenceHotel.documentId ? 2 : 1,
                borderColor: selectedHotel === conferenceHotel.documentId ? 'primary.main' : 'grey.200',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 3
                }
              }}
              onClick={() => handleHotelSelect(conferenceHotel.documentId)}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h4" gutterBottom>
                  {conferenceHotel.hotel.longName}
                </Typography>

                {conferenceHotel.hotel.addressCity && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {conferenceHotel.hotel.addressCity && `${conferenceHotel.hotel.addressCity}`}
                    {conferenceHotel.hotel.addressState && `, ${conferenceHotel.hotel.addressState}`}
                    {conferenceHotel.hotel.addressZip && ` ${conferenceHotel.hotel.addressZip}`}
                  </Typography>
                )}

                {conferenceHotel.hotel.website && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    <a href={conferenceHotel.hotel.website} target="_blank" rel="noopener noreferrer">
                      Visit Website
                    </a>
                  </Typography>
                )}

                {conferenceHotel.hotel.amenities && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="600" gutterBottom>
                      Amenities:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {expandedAmenities[conferenceHotel.hotel.documentId] 
                        ? conferenceHotel.hotel.amenities 
                        : truncateAmenities(conferenceHotel.hotel.amenities)
                      }
                      {conferenceHotel.hotel.amenities.length > 60 && (
                        <Button
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAmenitiesExpansion(conferenceHotel.hotel.documentId);
                          }}
                          sx={{ 
                            ml: 1, 
                            minWidth: 'auto', 
                            p: 0,
                            textTransform: 'none',
                            fontSize: '0.75rem'
                          }}
                        >
                          {expandedAmenities[conferenceHotel.hotel.documentId] ? 'Show less' : 'Show more'}
                        </Button>
                      )}
                    </Typography>
                  </Box>
                )}
              </CardContent>
              
              <CardActions>
                <Button
                  variant={selectedHotel === conferenceHotel.documentId ? "contained" : "outlined"}
                  color="primary"
                  fullWidth
                  onClick={() => handleHotelSelect(conferenceHotel.documentId)}
                >
                  {selectedHotel === conferenceHotel.documentId ? "Selected" : "Select Hotel"}
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