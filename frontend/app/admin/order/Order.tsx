"use client";

import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { APIHOST } from '../../common';
import { Order } from '../../types/order';
import { Occupant } from '@/app/types/occupant';
import { Room } from '@/app/types/room';

interface OrderDetailProps {
  orderId?: string;
}

export default function OrderDetail({ orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${APIHOST}/api/orders/${orderId}?populate[0]=conference_hotel.hotel&populate[1]=conference_hotel.conference&populate[2]=order_rooms.order_room_occupants`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
      console.error('Order detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="body1">Loading order details...</Typography>
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

  if (!order) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning">Order not found</Alert>
      </Paper>
    );
  }

  return (
    <Grid container sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Order Header */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Details
        </Typography>
        <Box sx={{float: 'right' }}>
          <Chip 
            label={order.orderStatus || 'Active'} 
            color="primary" 
            size="small" 
          />
          
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Order ID: {order.documentId} 
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Confirmation: {order.confirmation} 
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Created:</strong> {formatDateTime(order.createdAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <strong>Updated:</strong> {formatDateTime(order.updatedAt)}
        </Typography>

        <Divider sx={{ my: 3 }} />

       
              {order.conference_hotel?.conference ? (
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Conference:</strong> {order.conference_hotel.conference.longName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(order.conference_hotel.conference.defaultArrivalDate)} - {formatDate(order.conference_hotel.conference.defaultDepartureDate)}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No conference information available
                </Typography>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Hotel Information */}
              {order.conference_hotel?.hotel ? (
                <Box sx={{ display: 'grid', gap: 1 }}>
                  <Typography variant="body2">
                    <strong>Hotel:</strong> {order.conference_hotel.hotel.longName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.conference_hotel.hotel.addressCity}, {order.conference_hotel.hotel.addressState} {order.conference_hotel.hotel.addressZip}
                  </Typography>
                  {order.rewardsNumber && (
                    <Typography variant="body2">
                      <strong>Rewards:</strong> {order.rewardsNumber}
                    </Typography>
                  )}
                  
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="body2">
                          <strong>Notes for Hotel:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {order.notesForHotel || 'None'}
                        </Typography>
                      </Box>
               
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hotel selected
                </Typography>
              )}
      </Paper>

      

         

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid size={{xs:12, md:6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {order.contactFirstName} {order.contactLastName}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {order.contactEmail}
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {order.contactCell || 'Not provided'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Billing Information */}
        <Grid size={{xs:12, md:6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Billing Information
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Name:</strong> {order.billingAddressee}
                </Typography>
                <Typography variant="body2">
                  <strong>Address:</strong> {order.billingStreet1}
                  {order.billingStreet2 && `, ${order.billingStreet2}`}
                </Typography>
                <Typography variant="body2">
                  <strong>City:</strong> {order.billingCity}, {order.billingState} {order.billingZip}
                </Typography>
                <Typography variant="body2">
                  <strong>Country:</strong> {order.billingCountry}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transportation */}
        <Grid size={{xs:12, md:6}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transportation
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Bus Parking:</strong> {order.requiresBusParking ? 'Required' : 'Not required'}
                </Typography>
                <Typography variant="body2">
                  <strong>Transit to Venue:</strong> {order.requiresTransitToVenue ? 'Required' : 'Not required'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Details */}
        <Grid size={{xs:12, md:6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'grid', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Students Share Beds:</strong> {order.studentsShareBeds ? 'Yes' : 'No'}
                </Typography>
                {order.termsAccepted && (
                  <Typography variant="body2">
                    <strong>Terms Accepted:</strong> Yes
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rooms and Occupants */}
        <Grid size={{xs:12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rooms & Occupants ({order.order_rooms?.length || 0} rooms)
              </Typography>
              {order.order_rooms && order.order_rooms.length > 0 ? (
                order.order_rooms.map((room: Room, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600">
                      Room {index + 1}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'grid', gap: 1 }}>
                      <Typography variant="body2">
                        <strong>Type:</strong> {room.type || 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Check-in:</strong> {room.arrivalDate ? formatDate(room.arrivalDate) : 'Not specified'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Check-out:</strong> {room.departureDate ? formatDate(room.departureDate) : 'Not specified'}
                      </Typography>
                      {room.order_room_occupants && room.order_room_occupants.length > 0 && (
                        <>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Occupants ({room.order_room_occupants.length}):</strong>
                          </Typography>
                          <List dense>
                            {room.order_room_occupants.map((occupant: Occupant, occupantIndex: number) => (
                              <ListItem key={occupantIndex} sx={{ pl: 2 }}>
                                <ListItemText 
                                  primary={`${occupant.firstName} ${occupant.lastName}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No rooms found for this order
                </Typography>
              )}
              
              
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
}