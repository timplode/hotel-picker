"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Conference } from '../types/conference';
import { Order } from '../types/order';
import { Hotel } from '../types/hotel';
import { APIHOST } from '../common';

interface OrderSummaryProps {
  conference: Conference | null;
  order: Order;
  setOrderProp: (field: string, value: any) => void;
}

export default function OrderSummary({ conference, order, setOrderProp }: OrderSummaryProps) {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order.selectedHotel) {
      fetchHotelDetails();
    }
  }, [order.selectedHotel]);

  const fetchHotelDetails = async () => {
    if (!order.selectedHotel) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(
        `${APIHOST}/api/hotels/${order.selectedHotel}?populate=*`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotel details');
      }
      
      const data = await response.json();
      setSelectedHotel(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while loading hotel details');
      console.error('Error fetching hotel details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading order summary...
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

  return (
    <Box>
      
      {/* Conference Information Section */}
      {conference && <Box py={3}>
        
            
            
            <Typography variant="h6" fontWeight="600">
              {conference.longName}
            </Typography>
        </Box>
      }


      {/* Contact Information Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Contact
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 1 }}>
            {(order.contactFirstName || order.contactLastName) && (
              <Typography variant="body2">
                <strong>Name:</strong> {order.contactFirstName} {order.contactLastName}
              </Typography>
            )}
            
            {order.contactEmail && (
              <Typography variant="body2">
                <strong>Email:</strong> {order.contactEmail}
              </Typography>
            )}
            
            {order.contactCell && (
              <Typography variant="body2">
                <strong>Phone:</strong> {order.contactCell}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Billing Information Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Billing
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 1 }}>
            {order.billingAddressee && (
              <Typography variant="body2">
                <strong>Billing Name:</strong> {order.billingAddressee}
              </Typography>
            )}
            
            {order.billingStreet1 && (
              <Typography variant="body2">
                <strong>Address:</strong> {order.billingStreet1}
                {order.billingStreet2 && `, ${order.billingStreet2}`}
              </Typography>
            )}
            
            {(order.billingCity || order.billingCountry) && (
              <Typography variant="body2">
                <strong>City/Country:</strong> {order.billingCity}
                {order.billingCountry && `, ${order.billingCountry}`}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Room & Occupants Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Rooms & Occupants
          </Typography>
          
          <Box sx={{ display: 'grid', gap: 2 }}>
            {order.rooms && order.rooms.length > 0 ? (
              <>
                <Typography variant="body2">
                  <strong>Total Rooms:</strong> {order.rooms.length}
                </Typography>
                {order.rooms.map((room, index) => (
                  <Box key={index} sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'primary.light', ml: 1 }}>
                    <Typography variant="body2" fontWeight="600">
                      Room {index + 1}
                    </Typography>
                    
                    {room.type && (
                      <Typography variant="body2">
                        <strong>Type:</strong> {room.type}
                      </Typography>
                    )}
                    
                    {room.arrivalDate && (
                      <Typography variant="body2">
                        <strong>Check-in Date:</strong> {new Date(room.arrivalDate).toLocaleDateString()}
                      </Typography>
                    )}
                    
                    {room.departureDate && (
                      <Typography variant="body2">
                        <strong>Check-out Date:</strong> {new Date(room.departureDate).toLocaleDateString()}
                      </Typography>
                    )}

                    {room.occupants && room.occupants.length > 0 && (
                      <>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Occupants ({room.occupants.length}):</strong>
                        </Typography>
                        {room.occupants.map((occupant, occupantIndex) => (
                          <Typography key={occupantIndex} variant="body2" sx={{ ml: 2 }}>
                            • {occupant.firstName} {occupant.lastName}
                         
                          </Typography>
                        ))}
                      </>
                    )}
                    
                    
                  </Box>
                ))}
                {order.notesForHotel && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <strong>Special Requests:</strong> {order.notesForHotel}
                      </Typography>
                    )}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No rooms selected
              </Typography>
            )}
            
          
            
            {order.notesForHotel && (
              <Typography variant="body2">
                <strong>General Notes:</strong> {order.notesForHotel}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Hotel Information Section */}
      {selectedHotel && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              Hotel
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="600">
                {selectedHotel.longName}
              </Typography>
              
              {(selectedHotel.addressCity || selectedHotel.addressState || selectedHotel.addressZip) && (
                <Typography variant="body2" color="text.secondary">
                  {selectedHotel.addressCity}
                  {selectedHotel.addressState && `, ${selectedHotel.addressState}`}
                  {selectedHotel.addressZip && ` ${selectedHotel.addressZip}`}
                </Typography>
              )}
              
              {selectedHotel.website && (
                <Link href={selectedHotel.website} target="_blank" rel="noopener noreferrer" sx={{ fontSize: '0.875rem' }}>
                  Visit Hotel Website
                </Link>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {order.rewardsNumber && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>Rewards/Loyalty Number:</strong> {order.rewardsNumber}
                </Typography>
              </Box>
            )}

            {order.termsAccepted && (
              <Box sx={{ mb: 1 }}>
                <Chip 
                  label="Terms & Conditions Accepted" 
                  color="success" 
                  size="small" 
                  icon={<CheckCircleIcon />}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

    </Box>
  );
}