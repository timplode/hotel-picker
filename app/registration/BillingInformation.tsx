import { Grid, TextField, Box } from '@mui/material';
import { Order } from '../types/order';

interface BillingInformationProps {
  order: Order;
  setOrderProp: (field: string, value: any) => void;
}

export default function BillingInformation({
  order,
  setOrderProp
}: BillingInformationProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="Billing Name"
            value={order?.billingAddressee || ''}
            onChange={(e) => setOrderProp('billingAddressee', e.target.value)}
            variant="outlined"
            size="small"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="Street Address"
            value={order?.billingStreet1 || ''}
            onChange={(e) => setOrderProp('billingStreet1', e.target.value)}
            variant="outlined"
            size="small"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="Street Address Line 2"
            value={order?.billingStreet2 || ''}
            onChange={(e) => setOrderProp('billingStreet2', e.target.value)}
            variant="outlined"
            size="small"
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="City"
            value={order?.billingCity || ''}
            onChange={(e) => setOrderProp('billingCity', e.target.value)}
            variant="outlined"
            size="small"
            required
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3}}>
          <TextField
            fullWidth
            label="State"
            value={order?.billingState || ''}
            onChange={(e) => setOrderProp('billingState', e.target.value)}
            variant="outlined"
            size="small"
            required
            placeholder="CA"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3}}>
          <TextField
            fullWidth
            label="Postal Code"
            value={order?.billingZip || ''}
            onChange={(e) => setOrderProp('billingPostalCode', e.target.value)}
            variant="outlined"
            size="small"
            required
            placeholder="12345"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6}}>
          <TextField
            fullWidth
            label="Country"
            value={order?.billingCountry || ''}
            onChange={(e) => setOrderProp('billingCountry', e.target.value)}
            variant="outlined"
            size="small"
            required
            placeholder="United States"
          />
        </Grid>
      </Grid>
    </Box>
  );
}