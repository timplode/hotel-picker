"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContactInformation from './ContactInformation';
import { Order } from "../types/order";
import { Conference } from "../types/conference";
import BillingInformation from "./BillingInformation";
import RoomSelector from "./RoomSelector";
import TransportationSelector from "./TransportationSelector";
import HotelSelector from "./HotelSelector";
import HotelPaperwork from "./HotelPaperwork";
import OrderSummary from "./OrderSummary";
import { APIHOST } from '../common';



const NextStepButton = ({ onClick, disabled = false, children }: { 
  onClick: () => void; 
  disabled?: boolean;
  children?: React.ReactNode;
}) => (
  <Button
    variant="contained"
    color="primary"
    size="small"
    onClick={onClick}
    disabled={disabled}
    endIcon={<ArrowForwardIcon fontSize="small" />}
    sx={{ 
      px: 4, 
      py: 0.5,
      mt: 2
    }}
  >
    {children || 'Next Step'}
  </Button>
);

const PrevStepButton = ({ onClick, disabled = false, children }: { 
  onClick: () => void; 
  disabled?: boolean;
  children?: React.ReactNode;
}) => (
  <Button
    color="primary"
    size="small"
    onClick={onClick}
    disabled={disabled}
    startIcon={<ArrowBackIcon fontSize="small" />}
    sx={{ 
      px: 4, 
      py: 0.5,
      mt: 2
    }}
  >
    {children || 'Back'}
  </Button>
);


export default function Registration() {
  const [activeStep, setActiveStep] = useState(0);
  const [order, setOrder] = useState<Order>({contactFirstName: '', contactLastName: '', contactEmail: '', contactCell: '', billingCountry: 'US'} as Order);
  const [conference, setConference] = useState<Conference | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get('conferenceId');

  useEffect(() => {
    if (conferenceId) {
      const fetchConference = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await fetch(`${APIHOST}/api/conferences/${conferenceId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch conference data');
          }
          
          const data = await response.json();
          console.log('Fetched conference data:', data);
          setConference(data.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          console.error('Error fetching conference:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchConference();
    }
  }, [conferenceId]);

  const setOrderProp = (field: string, value: any) => {
    setOrder(prevOrder => ({
      ...prevOrder,
      [field]: value
    }));
    console.log(order)
  };

  const steps = [
    {
        label: 'Contact',
        content: <ContactInformation order={order} setOrderProp={setOrderProp} />
    },
    {
        label: 'Billing', 
        content: <BillingInformation order={order} setOrderProp={setOrderProp} />
    },
    {
        label: 'Occupants & Rooms',
        content: <RoomSelector order={order} setOrderProp={setOrderProp} conference={conference} />
    },
    {
        label: 'Transportation',
        content: <TransportationSelector order={order} setOrderProp={setOrderProp} conference={conference} />
    },
    {
        label: 'Hotel Selection',
        content: <HotelSelector order={order} setOrderProp={setOrderProp} conference={conference} />
    },
    {
        label: 'Hotel Paperwork',
        content: <HotelPaperwork order={order} setOrderProp={setOrderProp} conference={conference} />
    },
    {
        label: 'Review & Confirm',
        content: <OrderSummary order={order} setOrderProp={setOrderProp} conference={conference} />
    }
    ];

  const handleNextStep = async () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else if (activeStep === steps.length - 1) {
      // Final step: submit the registration
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(`${APIHOST}/api/orders/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: order }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit order');
        }

        const result = await response.json();
        console.log('Order submitted successfully:', result);
        
        // TODO: Redirect to success page or show success message
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit order');
        console.error('Order submission error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleOrderFieldChange = (field: string, value: string) => {
    setOrderProp(field, value);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Link href="/" passHref>
            <IconButton sx={{ mb: 3, color: 'primary.main' }}>
              <ArrowBackIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Back to Home
              </Typography>
            </IconButton>
          </Link>
          <Typography variant="h3" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
            Hotel Registration
          </Typography>
          {conference && (
            <Typography variant="h6" color="text.secondary">
              {conference.longName}
            </Typography>
          )}
          {loading && (
            <Typography variant="body2" color="primary">
              Loading conference data...
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error">
              Error: {error}
            </Typography>
          )}
        </Box>

        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 2 }}>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="body2" sx={{ fontWeight: activeStep === index ? 600 : 400 }}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  {step.content}
                  <PrevStepButton 
                    onClick={handlePreviousStep}
                    disabled={activeStep === 0}
                  />
                  <NextStepButton 
                    onClick={handleNextStep}
                  >
                    {activeStep === steps.length - 1 ? 'Complete Registration' : 'Next Step'}
                  </NextStepButton>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        
      </Container>
    </Box>
  );
}