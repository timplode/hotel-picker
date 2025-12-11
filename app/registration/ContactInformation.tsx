import { Grid, TextField, Box, Typography } from '@mui/material';
import { Order } from '../types/order';
import { isValidPhoneNumber } from '../../lib/validate';

interface OrderFormProps {
  order: Order,
  setOrderProp: (field: string, value: any) => void;
}

export default function ContactInformation({
  order,
  setOrderProp
}: OrderFormProps) {
  const phoneNumber = order?.contactCell || '';
  const isPhoneValid = phoneNumber === '' || isValidPhoneNumber(phoneNumber);
  return (
    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: '400px' }}>
     
          <TextField
            label="First Name"
            value={order?.contactFirstName}
            onChange={(e) => setOrderProp('contactFirstName', e.target.value)}
            variant="outlined"
            size="small"
            required
          />
        
          <TextField
            fullWidth
            label="Last Name"
            value={order?.contactLastName}
            onChange={(e) => setOrderProp('contactLastName', e.target.value)}
            variant="outlined"
            size="small"
            required
          />
      
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={order?.contactEmail}
            onChange={(e) => setOrderProp('contactEmail', e.target.value)}
            variant="outlined"
            size="small"
            required
          />
    
          <TextField
            fullWidth
            label="Mobile Phone"
            type="tel"
            value={order?.contactCell}
            onChange={(e) => setOrderProp('contactCell', e.target.value)}
            variant="outlined"
            size="small"
            required
            placeholder="(555) 123-4567"
            error={order?.contactCell !== ""}
            helperText={isValidPhoneNumber(order?.contactCell || "") === false ? 'Please enter a valid 10-digit phone number' : ''}
          />
    </Box>
  );
}