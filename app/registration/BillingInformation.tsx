import { Grid, Box, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Order } from '../types/order';
import ValidatedTextField from '../components/ValidatedTextField';
import { isMinLength2, isValidZip } from '@/lib/validate';
import { US_STATES } from '@/lib/states';
import { COUNTRIES } from '@/lib/country';

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
          <ValidatedTextField
            validator={isMinLength2}
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
          <ValidatedTextField
            validator={isMinLength2}
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
          <ValidatedTextField
            validator={isMinLength2}
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
          <ValidatedTextField
            validator={isMinLength2}
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
          <FormControl fullWidth size="small" required>
            <InputLabel>State</InputLabel>
            <Select
              value={order?.billingState || ''}
              onChange={(e) => setOrderProp('billingState', e.target.value)}
              label="State"
            >
              {Object.entries(US_STATES).map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 3}}>
          <ValidatedTextField
            validator={isValidZip}
            fullWidth
            label="Postal Code"
            value={order?.billingZip || ''}
            onChange={(e) => setOrderProp('billingZip', e.target.value)}
            variant="outlined"
            size="small"
            required
            placeholder="12345"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6}}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Country</InputLabel>
            <Select
              value={order?.billingCountry || 'US'}
              onChange={(e) => setOrderProp('billingCountry', e.target.value)}
              label="Country"
            >
              {Object.entries(COUNTRIES).map(([code, name]) => (
                <MenuItem key={code} value={code}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}