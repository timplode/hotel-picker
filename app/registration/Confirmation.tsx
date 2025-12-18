"use client";

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import PrintIcon from '@mui/icons-material/Print';
import { Order } from "../types/order";
import { Conference } from "../types/conference";

interface ConfirmationProps {
  order: Order;
  conference: Conference | null;
  orderResponse?: any;
}

export default function Confirmation({ order, conference, orderResponse }: ConfirmationProps) {
  const handlePrint = () => {
    window.print();
  };

  const confirmationNumber = orderResponse?.id || orderResponse?.documentId || 'N/A';

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      {/* Success Header */}
      <Box sx={{ mb: 4 }}>
        <CheckCircleOutlineIcon 
          sx={{ 
            fontSize: 80, 
            color: 'success.main', 
            mb: 2 
          }} 
        />
        <Typography variant="h4" component="h2" color="success.main" gutterBottom>
          Registration Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your conference registration has been successfully submitted.
        </Typography>
      </Box>

      {/* Confirmation Details */}
      <Paper sx={{ p: 3, mb: 3, textAlign: 'left' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />
          Confirmation Details
        </Typography>
        
        <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
          <Typography variant="body1">
            <strong>Confirmation Number:</strong> {confirmationNumber}
          </Typography>
          
          {conference && (
            <Typography variant="body1">
              <strong>Conference:</strong> {conference.longName}
            </Typography>
          )}
          
          <Typography variant="body1">
            <strong>Contact Name:</strong> {order.contactFirstName} {order.contactLastName}
          </Typography>
          
          <Typography variant="body1">
            <strong>Email:</strong> {order.contactEmail}
          </Typography>
          
          {order.order_rooms && (
            <Typography variant="body1">
              <strong>Rooms Booked:</strong> {order.order_rooms.length} room{order.order_rooms.length !== 1 ? 's' : ''}
            </Typography>
          )}
          
          <Typography variant="body1">
            <strong>Submitted:</strong> {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      {/* Next Steps */}
      <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="body2" gutterBottom>
          <strong>What happens next?</strong>
        </Typography>
        <Typography variant="body2">
          • A confirmation email will be sent to {order.contactEmail}<br/>
          • Hotel reservations will be processed within 24-48 hours<br/>
          • You will receive booking confirmation from the hotel directly<br/>
          • Keep your confirmation number for reference
        </Typography>
      </Alert>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<EmailIcon />}
          onClick={() => window.location.href = `mailto:${order.contactEmail}?subject=Conference Registration Confirmation&body=Your registration has been confirmed. Confirmation Number: ${confirmationNumber}`}
        >
          Email Confirmation
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print Confirmation
        </Button>
        
        <Button
          variant="outlined"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
      </Box>

      {/* Important Notes */}
      <Paper sx={{ p: 2, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Important:</strong> Please save this confirmation number and check your email for additional details. 
          If you don't receive a confirmation email within 24 hours, please contact support.
        </Typography>
      </Paper>
    </Box>
  );
}