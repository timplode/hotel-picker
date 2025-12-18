"use client";

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Popover,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Link
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Conference } from '../types/conference';
import { Order } from '../types/order';

interface HotelPaperworkProps {
  conference: Conference | null;
  order: Order;
  setOrderProp: (field: string, value: any) => void;
}

export default function HotelPaperwork({ conference, order, setOrderProp }: HotelPaperworkProps) {
  const [rewardsNumber, setRewardsNumber] = useState<string>(order.rewardsNumber || '');
  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(order.termsAccepted || false);

  const handleRewardsNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setRewardsNumber(value);
    setOrderProp('rewardsNumber', value);
  };

  const handleTermsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setTermsAccepted(checked);
    setOrderProp('termsAccepted', checked);
  };

  const handleInfoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setInfoAnchorEl(event.currentTarget);
  };

  const handleInfoClose = () => {
    setInfoAnchorEl(null);
  };

  const infoOpen = Boolean(infoAnchorEl);

  if (!order.selectedHotel) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" gutterBottom>
          No Hotel Selected
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please select a hotel first before proceeding with the paperwork.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
        Hotel Paperwork & Additional Information
      </Typography>

      {/* Rewards Number Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Rewards/Loyalty #"
          placeholder="Enter your rewards or loyalty program number"
          value={rewardsNumber}
          onChange={handleRewardsNumberChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="rewards program info"
                  onClick={handleInfoClick}
                  edge="end"
                  size="small"
                >
                  <InfoIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Popover
        open={infoOpen}
        anchorEl={infoAnchorEl}
        onClose={handleInfoClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, maxWidth: 300 }}>
          <Typography variant="body2" fontWeight="600" gutterBottom>
            Rewards/Loyalty Program Information
          </Typography>
          <Typography variant="body2">
            If you have a rewards or loyalty program number with any of these hotels 
            (such as Marriott Bonvoy, Hilton Honors, IHG Rewards, etc.), enter it here 
            to ensure you receive points for your stay and any applicable member benefits.
          </Typography>
        </Box>
      </Popover>

      {/* Terms and Conditions Checkbox */}
      <FormControlLabel
        control={
          <Checkbox
            checked={termsAccepted}
            onChange={handleTermsChange}
            color="primary"
          />
        }
        label={
          <Typography variant="body2">
            I agree to the{' '}
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Open terms and conditions modal or navigate to terms page
                console.log('Open terms and conditions');
              }}
            >
              hotel terms and conditions
            </Link>
          </Typography>
        }
        sx={{ mt: 2 }}
      />
    </Box>
  );
}