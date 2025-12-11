import { useState } from 'react';
import { useWalletConnect } from '../../hooks/useWalletConnect';
import { useAuth } from '../../hooks/useAuth';

export function WalletLoginButton() {
  const { 
    connectWallet, 
    signMessage, 
    isConnecting, 
    error: walletError,
    clearError 
  } = useWalletConnect();
  
  const { 
    loginWithWallet, 
    registerWithWallet, 
    getWalletNonce 
  } = useAuth();

  const [step, setStep] = useState<'connect' | 'register' | 'complete'>('connect');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresEmail, setRequiresEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    clearError();
    setLoading(true);

    try {
      // Step 1: Connect wallet
      const address = await connectWallet();
      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      setWalletAddress(address);

      // Step 2: Get nonce from backend
      const nonceResult = await getWalletNonce(address);
      if (nonceResult.error || !nonceResult.nonce || !nonceResult.message) {
        throw new Error(nonceResult.error || 'Failed to get nonce');
      }

      setNonce(nonceResult.nonce);

      // Step 3: Sign message
      const sig = await signMessage(nonceResult.message);
      setSignature(sig);

      // Step 4: Attempt login
      const loginResult = await loginWithWallet(address, sig, nonceResult.nonce);

      if (loginResult.success) {
        // Login successful
        setStep('complete');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else if (loginResult.requiresRegistration) {
        // Need to register - show email form
        setRequiresEmail(true);
        setStep('register');
      } else {
        throw new Error(loginResult.error || 'Login failed');
      }

    } catch (err: any) {
      console.error('Wallet login error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !walletAddress || !signature || !nonce) {
      setError('Missing required information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await registerWithWallet(
        walletAddress,
        signature,
        nonce,
        email
      );

      if (result.success) {
        setStep('complete');
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        throw new Error(result.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'complete') {
    return (
      <div className="wallet-login-success">
        <div className="success-icon">✓</div>
        <p>Success! Redirecting...</p>
      </div>
    );
  }

  if (step === 'register' && requiresEmail) {
    return (
      <div className="wallet-register-form">
        <h3>Complete Registration</h3>
        <p className="wallet-address">
          Wallet: {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
        </p>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
            <small>Required to complete your account setup and start your 7-day free trial</small>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading || !email}
            className="btn-primary"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>
        
        <style jsx>{`
          .wallet-register-form {
            max-width: 400px;
            margin: 0 auto;
            padding: 24px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            background: white;
          }
          
          h3 {
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
          }
          
          .wallet-address {
            font-family: monospace;
            font-size: 14px;
            color: #8a8f9e;
            margin-bottom: 20px;
            padding: 8px 12px;
            background: #f5f5f5;
            border-radius: 4px;
          }
          
          .form-group {
            margin-bottom: 16px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            font-size: 14px;
          }
          
          input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          }
          
          input:focus {
            outline: none;
            border-color: #4285f4;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
          }
          
          input:disabled {
            background: #f5f5f5;
            cursor: not-allowed;
          }
          
          small {
            display: block;
            margin-top: 4px;
            font-size: 12px;
            color: #8a8f9e;
          }
          
          .error-message {
            padding: 12px;
            background: #fee;
            border: 1px solid #fcc;
            border-radius: 6px;
            color: #c33;
            font-size: 14px;
            margin-bottom: 16px;
          }
          
          .btn-primary {
            width: 100%;
            padding: 12px;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .btn-primary:hover:not(:disabled) {
            background: #3367d6;
          }
          
          .btn-primary:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="wallet-login-button-container">
      <button
        onClick={handleConnect}
        disabled={loading || isConnecting}
        className="wallet-login-button"
      >
        {loading || isConnecting ? (
          <>
            <span className="spinner"></span>
            Connecting...
          </>
        ) : (
          <>
            <svg className="metamask-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21.5 12c0 5.247-4.253 9.5-9.5 9.5S2.5 17.247 2.5 12 6.753 2.5 12 2.5s9.5 4.253 9.5 9.5z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Connect Wallet
          </>
        )}
      </button>
      
      {(error || walletError) && (
        <div className="error-message">
          {error || walletError}
        </div>
      )}
      
      <p className="wallet-help">
        Sign in with MetaMask or WalletConnect
      </p>
      
      <style jsx>{`
        .wallet-login-button-container {
          margin: 16px 0;
        }
        
        .wallet-login-button {
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .wallet-login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .wallet-login-button:active:not(:disabled) {
          transform: translateY(0);
        }
        
        .wallet-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .metamask-icon {
          width: 24px;
          height: 24px;
        }
        
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          margin-top: 12px;
          padding: 12px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 6px;
          color: #c33;
          font-size: 14px;
        }
        
        .wallet-help {
          margin-top: 8px;
          text-align: center;
          font-size: 13px;
          color: #8a8f9e;
        }
        
        .wallet-login-success {
          text-align: center;
          padding: 24px;
        }
        
        .success-icon {
          font-size: 48px;
          color: #4caf50;
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
}
