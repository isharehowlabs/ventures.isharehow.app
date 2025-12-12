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


function BillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [shopifyCustomerId, setShopifyCustomerId] = useState<string | null>(null);
  const [shopifyStoreUrl, setShopifyStoreUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      
      // Fetch user profile to get Shopify customer ID and store URL
      const profileResponse = await fetch(`${backendUrl}/api/profile`, {
        credentials: 'include',
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setShopifyCustomerId(profileData.shopifyCustomerId || null);
      }

      // Fetch Shopify store URL
      const shopifyResponse = await fetch(`${backendUrl}/api/shopify/store-url`, {
        credentials: 'include',
      });
      
      if (shopifyResponse.ok) {
        const shopifyData = await shopifyResponse.json();
        setShopifyStoreUrl(shopifyData.storeUrl || null);
      }

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
                {/* Subscription Tab - Shopify Embed */}
                {activeTab === 0 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                        Manage Your Subscription
                      </Typography>
                      {shopifyStoreUrl ? (
                        <Box sx={{ width: '100%', height: '800px', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          <iframe
                            src={`${shopifyStoreUrl}/account`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{
                              border: 'none',
                              borderRadius: '8px',
                            }}
                            title="Shopify Customer Portal"
                            allow="payment"
                          />
                        </Box>
                      ) : (
                        <Alert severity="info">
                          <Typography variant="body2">
                            Loading Shopify customer portal...
                          </Typography>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Payment Methods Tab */}
                {activeTab === 1 && (
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
                {activeTab === 2 && (
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

