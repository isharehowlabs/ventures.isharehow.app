import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Typography, Paper, Alert, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useWalletConnect } from '../hooks/useWalletConnect';

export default function LinkWalletPage() {
  const router = useRouter();
  const { user, isAuthenticated, linkWallet, getWalletNonce } = useAuth();
  const { connectWallet, signMessage, isConnecting, error: walletError, clearError } = useWalletConnect();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      router.push('/');
    }
    return null;
  }

  const handleLinkWallet = async () => {
    setError(null);
    setSuccess(false);
    clearError();
    setLoading(true);

    try {
      // Step 1: Connect wallet
      const address = await connectWallet();
      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      // Step 2: Get nonce
      const nonceResult = await getWalletNonce(address);
      if (nonceResult.error || !nonceResult.nonce || !nonceResult.message) {
        throw new Error(nonceResult.error || 'Failed to get nonce');
      }

      // Step 3: Sign message
      const signature = await signMessage(nonceResult.message);

      // Step 4: Link wallet to account
      const result = await linkWallet(address, signature, nonceResult.nonce);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to link wallet');
      }

    } catch (err: any) {
      console.error('Error linking wallet:', err);
      setError(err.message || 'Failed to link wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Link Your Wallet
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Connect your Ethereum wallet to enable Web3 features and wallet-based login
        </Typography>

        {/* Current User Info */}
        {user && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Current Account
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user.username || user.email}
            </Typography>
            {user.cryptoAddress && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                ✓ Wallet already linked: {user.cryptoAddress.substring(0, 6)}...
                {user.cryptoAddress.substring(38)}
              </Typography>
            )}
          </Box>
        )}

        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Wallet linked successfully! Redirecting to profile...
          </Alert>
        )}

        {/* Error Messages */}
        {(error || walletError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || walletError}
          </Alert>
        )}

        {/* Benefits */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Benefits of linking your wallet:
          </Typography>
          <Box component="ul" sx={{ pl: 3, '& li': { mb: 1 } }}>
            <li>
              <Typography variant="body2">
                Login with MetaMask (no password needed)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Pay for upgrades with cryptocurrency ($17.99 in ETH to isharehow.eth)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Access Web3 features and ENS integration
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Secure, decentralized authentication
              </Typography>
            </li>
          </Box>
        </Box>

        {/* Link Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLinkWallet}
          disabled={loading || isConnecting || success}
          sx={{
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
            },
          }}
        >
          {loading || isConnecting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Connecting...
            </>
          ) : success ? (
            '✓ Wallet Linked!'
          ) : user?.cryptoAddress ? (
            'Update Wallet Connection'
          ) : (
            'Connect Wallet'
          )}
        </Button>

        {/* Info Note */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block', textAlign: 'center' }}>
          This will open MetaMask and ask you to sign a message. No gas fees required.
        </Typography>

        {/* Back Link */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => router.push('/profile')}
            disabled={loading}
          >
            ← Back to Profile
          </Button>
        </Box>
      </Paper>

      {/* Additional Info */}
      <Paper elevation={1} sx={{ mt: 3, p: 3, bgcolor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          How it works:
        </Typography>
        <Typography variant="body2" paragraph>
          1. Click "Connect Wallet" to open MetaMask
        </Typography>
        <Typography variant="body2" paragraph>
          2. Approve the connection request
        </Typography>
        <Typography variant="body2" paragraph>
          3. Sign a message to verify ownership (no fees)
        </Typography>
        <Typography variant="body2">
          4. Your wallet will be linked to your account
        </Typography>
      </Paper>

      {/* Payment Info */}
      {!user?.isPaidMember && (
        <Paper elevation={1} sx={{ mt: 3, p: 3, bgcolor: 'warning.light' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
            💡 Upgrade with Cryptocurrency
          </Typography>
          <Typography variant="body2" paragraph>
            After linking your wallet, you can upgrade to User tier ($17.77/month) by subscribing via Shopify:
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => window.location.href = 'https://shop.isharehow.app/pages/manage-subscriptions'}
            sx={{ mt: 2 }}
          >
            Subscribe via Shopify ($17.77/month)
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Or send ETH to isharehow.eth for manual upgrade verification.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}
