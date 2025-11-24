import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import LoginForm from './LoginForm';
import PatreonVerification from './PatreonVerification';
import RegisterForm from './RegisterForm';

interface PatreonAuthProps {
  onSuccess?: () => void;
}

type AuthStep = 'login' | 'register' | 'verify';

export default function PatreonAuth({ onSuccess }: PatreonAuthProps) {
  const [step, setStep] = useState<AuthStep>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check for Patreon connection success from OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('patreon_connected') === 'true') {
        const token = urlParams.get('token');
        if (token) {
          localStorage.setItem('auth_token', token);
          setAuthToken(token);
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
          // Refresh to get updated user data
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
      }
    }
  }, []);

  const handleLoginSuccess = (token: string, userData: any) => {
    setAuthToken(token);
    setUser(userData);
    
    // Check if user needs Patreon verification
    if (userData.needsPatreonVerification || !userData.patreonConnected) {
      setStep('verify');
    } else {
      // User is fully authenticated
      if (onSuccess) {
        onSuccess();
      } else {
        // Refresh the page to update auth state
        window.location.reload();
      }
    }
  };

  const handleVerificationSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      // Refresh the page to update auth state
      window.location.reload();
    }
  };

  const handleSkipVerification = () => {
    // Allow access but with limited features
    if (onSuccess) {
      onSuccess();
    } else {
      window.location.reload();
    }
  };

  if (step === 'register') {
    return (
      <RegisterForm
        onSuccess={handleLoginSuccess}
        onLoginClick={() => setStep('login')}
      />
    );
  }

  if (step === 'verify' && authToken) {
    return (
      <PatreonVerification
        token={authToken}
        onSuccess={handleVerificationSuccess}
        onSkip={handleSkipVerification}
      />
    );
  }

  return (
    <LoginForm
      onSuccess={handleLoginSuccess}
      onRegisterClick={() => setStep('register')}
    />
  );
}
