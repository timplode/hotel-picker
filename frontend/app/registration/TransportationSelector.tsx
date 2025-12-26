"use client";

import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  Divider,
  Switch,
  Stack
} from '@mui/material';
import { Order } from "../types/order";
import { Conference } from "../types/conference";

interface TransportationSelectorProps {
  order: Order;
  setOrderProp: (field: string, value: any) => void;
  conference: Conference | null;
}

export default function TransportationSelector({ order, setOrderProp, conference }: TransportationSelectorProps) {
  const handleTransportationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOrderProp('transportation', event.target.value);
  };

  const handleToggleChange = (field: 'requiresBusParking' | 'requiresTransitToVenue') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOrderProp(field, event.target.checked);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
       Please tell us about your transportation needs so we can better serve you picking a hotel.
      </Typography>

      <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={order.requiresBusParking || false}
                  onChange={handleToggleChange('requiresBusParking')}
                  name="requiresBusParking"
                />
              }
              label="I need bus parking at the hotel"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={order.requiresTransitToVenue || false}
                  onChange={handleToggleChange('requiresTransitToVenue')}
                  name="requiresTransitToVenue"
                />
              }
              label="I need transportation between the hotel and the conference"
            />
      </Stack>
    </Box>
  );
}