import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
// PatreonVerification removed - verification handled automatically by backend cron job

interface PatreonAuthProps {
  onSuccess?: () => void;
}

type AuthStep = 'login' | 'register';

export default function PatreonAuth({ onSuccess }: PatreonAuthProps) {
  const [step, setStep] = useState<AuthStep>('login');

  // Check for Patreon connection success from OAuth callback
  // JWT is now in httpOnly cookie, no need to extract from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('patreon_connected') === 'true' || urlParams.get('auth') === 'success') {
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        // Refresh to get updated user data (JWT is in cookie)
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  }, []);

  const handleLoginSuccess = (token: string, userData: any) => {
    // JWT is in httpOnly cookie now, no need to store token
    // Patreon verification is handled automatically by cron job
    // User is fully authenticated after login/register
    if (onSuccess) {
      onSuccess();
    } else {
      // Refresh the page to update auth state
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

  // Patreon verification step removed - handled automatically by backend cron job
  // No need for user-facing verification UI

  return (
    <LoginForm
      onSuccess={handleLoginSuccess}
      onRegisterClick={() => setStep('register')}
    />
  );
}
