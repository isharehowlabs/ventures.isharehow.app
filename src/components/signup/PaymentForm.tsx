import React from 'react';
import {
  Box,
  TextField,
  Stack,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormHelperText,
  Link,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';

interface PaymentFormData {
  paymentMethod: 'card' | 'paypal' | 'bank';
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  taxId: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface PaymentFormProps {
  data: PaymentFormData;
  onChange: (field: keyof PaymentFormData, value: string | boolean) => void;
  errors?: Partial<Record<keyof PaymentFormData, string>>;
  isEnterprise?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  data,
  onChange,
  errors = {},
  isEnterprise = false,
}) => {
  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        Payment Information
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Your payment information is encrypted and secure.
      </Typography>

      <Stack spacing={4}>
        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
            Payment Method
          </FormLabel>
          <RadioGroup
            value={data.paymentMethod}
            onChange={(e) => onChange('paymentMethod', e.target.value as 'card' | 'paypal' | 'bank')}
          >
            <FormControlLabel
              value="card"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <CreditCardIcon />
                  <Typography>Credit Card</Typography>
                </Stack>
              }
            />
            <FormControlLabel
              value="paypal"
              control={<Radio />}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <BankIcon />
                  <Typography>PayPal</Typography>
                </Stack>
              }
            />
            {isEnterprise && (
              <FormControlLabel
                value="bank"
                control={<Radio />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BankIcon />
                    <Typography>Bank Transfer</Typography>
                  </Stack>
                }
              />
            )}
          </RadioGroup>
        </FormControl>

        {data.paymentMethod === 'card' && (
          <Box>
            <TextField
              fullWidth
              label="Cardholder Name"
              required
              value={data.cardName}
              onChange={(e) => onChange('cardName', e.target.value)}
              error={!!errors.cardName}
              helperText={errors.cardName}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Card Number"
              required
              value={data.cardNumber}
              onChange={(e) => onChange('cardNumber', e.target.value)}
              error={!!errors.cardNumber}
              helperText={errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Expiry Date"
                required
                value={data.cardExpiry}
                onChange={(e) => onChange('cardExpiry', e.target.value)}
                error={!!errors.cardExpiry}
                helperText={errors.cardExpiry}
                placeholder="MM/YY"
              />
              <TextField
                fullWidth
                label="CVC"
                required
                value={data.cardCVC}
                onChange={(e) => onChange('cardCVC', e.target.value)}
                error={!!errors.cardCVC}
                helperText={errors.cardCVC}
                placeholder="123"
              />
            </Stack>
          </Box>
        )}

        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Billing Address
          </Typography>
          <TextField
            fullWidth
            label="Street Address"
            required
            value={data.billingAddress}
            onChange={(e) => onChange('billingAddress', e.target.value)}
            error={!!errors.billingAddress}
            helperText={errors.billingAddress}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="City"
              required
              value={data.billingCity}
              onChange={(e) => onChange('billingCity', e.target.value)}
              error={!!errors.billingCity}
              helperText={errors.billingCity}
            />
            <TextField
              fullWidth
              label="State/Province"
              required
              value={data.billingState}
              onChange={(e) => onChange('billingState', e.target.value)}
              error={!!errors.billingState}
              helperText={errors.billingState}
            />
            <TextField
              fullWidth
              label="ZIP/Postal Code"
              required
              value={data.billingZip}
              onChange={(e) => onChange('billingZip', e.target.value)}
              error={!!errors.billingZip}
              helperText={errors.billingZip}
            />
          </Stack>
          <TextField
            fullWidth
            label="Country"
            required
            value={data.billingCountry}
            onChange={(e) => onChange('billingCountry', e.target.value)}
            error={!!errors.billingCountry}
            helperText={errors.billingCountry}
          />
        </Box>

        {isEnterprise && (
          <TextField
            fullWidth
            label="Tax ID / VAT Number (Optional)"
            value={data.taxId}
            onChange={(e) => onChange('taxId', e.target.value)}
            error={!!errors.taxId}
            helperText={errors.taxId}
          />
        )}

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={data.acceptTerms}
                onChange={(e) => onChange('acceptTerms', e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/terms" target="_blank">
                  Terms & Conditions
                </Link>
              </Typography>
            }
          />
          {errors.acceptTerms && (
            <FormHelperText error>{errors.acceptTerms}</FormHelperText>
          )}
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={data.acceptPrivacy}
                onChange={(e) => onChange('acceptPrivacy', e.target.checked)}
              />
            }
            label={
              <Typography variant="body2">
                I agree to the{' '}
                <Link href="/privacy" target="_blank">
                  Privacy Policy
                </Link>
              </Typography>
            }
          />
          {errors.acceptPrivacy && (
            <FormHelperText error>{errors.acceptPrivacy}</FormHelperText>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default PaymentForm;

