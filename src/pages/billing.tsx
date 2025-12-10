'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { getBackendUrl } from '../utils/backendUrl';
import PricingTierCard, { PricingTier } from '../components/pricing/PricingTierCard';
import PricingToggle from '../components/pricing/PricingToggle';

interface Subscription {
  id: string;
  tier: string;
  billingCycle: string;
  status: 'active' | 'cancelled' | 'pending' | 'expired';
  amount: number;
  currency: string;
  startedAt?: string;
  expiresAt?: string;
  cancelledAt?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  date: string;
  periodStart: string;
  periodEnd: string;
  invoicePdf?: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 399,
    priceAnnual: 3830,
    description: 'Perfect for small businesses, startups, and individual creators',
    color: '#22D3EE',
    features: [
      '10-20 requests per month',
      'Standard turnaround (48-72 hours)',
      'Email support',
      'Basic design services',
      'Access to Co-Work Dashboard',
      'Access to Rise Dashboard',
      'Basic CaaS features',
    ],
    ctaText: 'Select Plan',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1499,
    priceAnnual: 14390,
    description: 'Ideal for growing businesses, agencies, and projects',
    color: '#8b5cf6',
    popular: true,
    features: [
      'Unlimited requests',
      'Priority turnaround (24-48 hours)',
      'Dedicated project manager',
      'Advanced design services',
      'Full CaaS access',
      'API integrations',
      'Analytics dashboard',
      'Priority support',
    ],
    ctaText: 'Select Plan',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9000,
    priceAnnual: 86400,
    description: 'For large enterprises and agencies with high volume needs',
    color: '#f59e0b',
    features: [
      'Unlimited requests and revisions',
      'Same-day turnaround',
      'Dedicated team',
      'Custom integrations',
      'White-label options',
      'Advanced security features',
      'SLA guarantees',
      'Custom contract terms',
      'Platform/service fee included',
    ],
    ctaText: 'Select Plan',
  },
];

function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      
      // Fetch subscription
      const subResponse = await fetch(`${backendUrl}/api/subscriptions/current`, {
        credentials: 'include',
      });
      
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription || null);
      }

      // Fetch payment methods
      const pmResponse = await fetch(`${backendUrl}/api/billing/payment-methods`, {
        credentials: 'include',
      });
      
      if (pmResponse.ok) {
        const pmData = await pmResponse.json();
        setPaymentMethods(pmData.paymentMethods || []);
      }

      // Fetch invoices
      const invResponse = await fetch(`${backendUrl}/api/billing/invoices`, {
        credentials: 'include',
      });
      
      if (invResponse.ok) {
        const invData = await invResponse.json();
        setInvoices(invData.invoices || []);
      }
    } catch (err: any) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (tierId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier: tierId,
          billingCycle: isAnnual ? 'annual' : 'monthly',
        }),
      });

      if (response.ok) {
        await fetchBillingData();
        setActiveTab(0); // Switch to subscription tab
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to subscribe');
      }
    } catch (err: any) {
      setError('Failed to subscribe');
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.')) {
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        await fetchBillingData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to cancel subscription');
      }
    } catch (err: any) {
      setError('Failed to cancel subscription');
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/subscriptions/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        await fetchBillingData();
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to resume subscription');
      }
    } catch (err: any) {
      setError('Failed to resume subscription');
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    console.log('Download invoice:', invoiceId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'success';
      case 'pending':
        return 'info';
      case 'open':
        return 'warning';
      case 'cancelled':
      case 'void':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <ProtectedRoute>
      <AppShell active="billing">
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Container maxWidth="lg">
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Billing & Subscription
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Manage your subscription, payment methods, and billing history
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Subscription" />
                <Tab label="Pricing Plans" />
                <Tab label="Payment Methods" />
                <Tab label="Billing History" />
              </Tabs>
            </Paper>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Subscription Tab */}
                {activeTab === 0 && (
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                          <Typography variant="h5" fontWeight={600} gutterBottom>
                            Current Plan
                          </Typography>
                          {subscription ? (
                            <Stack spacing={1} sx={{ mt: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h4" fontWeight={700}>
                                  {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
                                </Typography>
                                <Chip
                                  label={subscription.status}
                                  color={getStatusColor(subscription.status) as any}
                                  size="small"
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {formatCurrency(subscription.amount, subscription.currency)} per {subscription.billingCycle}
                              </Typography>
                              {subscription.expiresAt && (
                                <Typography variant="body2" color="text.secondary">
                                  {subscription.cancelledAt
                                    ? `Cancelled on ${formatDate(subscription.cancelledAt)}`
                                    : `Expires on ${formatDate(subscription.expiresAt)}`}
                                </Typography>
                              )}
                              {subscription.startedAt && (
                                <Typography variant="body2" color="text.secondary">
                                  Started on {formatDate(subscription.startedAt)}
                                </Typography>
                              )}
                            </Stack>
                          ) : (
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                              No active subscription. Select a plan below to get started.
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" spacing={2}>
                          {subscription && subscription.status === 'active' && !subscription.cancelledAt && (
                            <Button
                              variant="outlined"
                              color="error"
                              onClick={handleCancelSubscription}
                            >
                              Cancel Subscription
                            </Button>
                          )}
                          {subscription && subscription.cancelledAt && (
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={handleResumeSubscription}
                            >
                              Resume Subscription
                            </Button>
                          )}
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Pricing Plans Tab */}
                {activeTab === 1 && (
                  <Box>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                      <Typography variant="h4" fontWeight={700} gutterBottom>
                        Choose Your Plan
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Select the plan that best fits your needs. You can change it anytime.
                      </Typography>
                    </Box>

                    {/* Pricing Toggle */}
                    <PricingToggle isAnnual={isAnnual} onChange={setIsAnnual} />

                    {/* Pricing Tiers */}
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                      {pricingTiers.map((tier) => {
                        const isCurrentPlan = subscription?.tier === tier.id;
                        return (
                          <Grid item xs={12} md={4} key={tier.id}>
                            <Box
                              sx={{
                                position: 'relative',
                                border: isCurrentPlan ? `3px solid ${tier.color}` : 'none',
                                borderRadius: 2,
                                p: isCurrentPlan ? 0.5 : 0,
                                transition: 'all 0.3s',
                              }}
                            >
                              {isCurrentPlan && (
                                <Chip
                                  label="Current Plan"
                                  color="primary"
                                  sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    zIndex: 1,
                                    fontWeight: 700,
                                  }}
                                />
                              )}
                              <PricingTierCard
                                tier={tier}
                                isAnnual={isAnnual}
                                onSelect={handleSelectPlan}
                              />
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>

                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        <strong>No hidden fees. No surprises.</strong> All plans include full access to our platform and support.
                      </Typography>
                    </Alert>
                  </Box>
                )}

                {/* Payment Methods Tab */}
                {activeTab === 2 && (
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                          Payment Methods
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => setAddPaymentDialogOpen(true)}
                        >
                          Add Payment Method
                        </Button>
                      </Box>
                      {paymentMethods.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <PaymentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No payment methods on file
                          </Typography>
                        </Box>
                      ) : (
                        <List>
                          {paymentMethods.map((method) => (
                            <ListItem
                              key={method.id}
                              sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                mb: 1,
                              }}
                            >
                              <ListItemIcon>
                                <CreditCardIcon />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" fontWeight={500}>
                                      {method.brand ? `${method.brand.toUpperCase()} •••• ${method.last4}` : `•••• ${method.last4}`}
                                    </Typography>
                                    {method.isDefault && (
                                      <Chip label="Default" size="small" color="primary" />
                                    )}
                                  </Box>
                                }
                                secondary={
                                  method.expMonth && method.expYear
                                    ? `Expires ${method.expMonth}/${method.expYear}`
                                    : method.type === 'bank_account'
                                    ? 'Bank Account'
                                    : 'Card'
                                }
                              />
                              <ListItemSecondaryAction>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Edit">
                                    <IconButton size="small">
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete">
                                    <IconButton size="small" color="error">
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Stack>
                              </ListItemSecondaryAction>
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Billing History Tab */}
                {activeTab === 3 && (
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                          Billing History
                        </Typography>
                        <IconButton size="small" onClick={fetchBillingData}>
                          <RefreshIcon />
                        </IconButton>
                      </Box>
                      {invoices.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <ReceiptIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No invoices found
                          </Typography>
                        </Box>
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                  <TableCell>{formatDate(invoice.date)}</TableCell>
                                  <TableCell>{formatCurrency(invoice.amount, invoice.currency)}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={invoice.status}
                                      color={getStatusColor(invoice.status) as any}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDownloadInvoice(invoice.id)}
                                      disabled={!invoice.invoicePdf}
                                    >
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Add Payment Method Dialog */}
            <Dialog open={addPaymentDialogOpen} onClose={() => setAddPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    placeholder="1234 5678 9012 3456"
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        placeholder="MM/YY"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVC"
                        placeholder="123"
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    placeholder="John Doe"
                  />
                  <FormControlLabel
                    control={<input type="checkbox" defaultChecked />}
                    label="Set as default payment method"
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setAddPaymentDialogOpen(false)}>Cancel</Button>
                <Button variant="contained" onClick={() => setAddPaymentDialogOpen(false)}>
                  Add Payment Method
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </AppShell>
    </ProtectedRoute>
  );
}

export default BillingPage;

