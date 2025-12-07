import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export interface UseWalletConnectReturn {
  address: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
  chainId: number | null;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
  switchChain: (chainId: number) => Promise<void>;
  clearError: () => void;
}

export function useWalletConnect(): UseWalletConnectReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            
            const chainIdHex = await window.ethereum.request({ 
              method: 'eth_chainId' 
            });
            setChainId(parseInt(chainIdHex, 16));
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected wallet
        setAddress(null);
        setError('Wallet disconnected');
      } else {
        setAddress(accounts[0]);
        setError(null);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
      // Reload to avoid state issues
      window.location.reload();
    };

    const handleDisconnect = () => {
      setAddress(null);
      setError('Wallet disconnected');
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);
    window.ethereum.on?.('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const connectWallet = useCallback(async (): Promise<string | null> => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const connectedAddress = accounts[0];
      setAddress(connectedAddress);

      // Get chain ID
      const chainIdHex = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      setChainId(parseInt(chainIdHex, 16));

      console.log('Wallet connected:', connectedAddress);
      console.log('Chain ID:', parseInt(chainIdHex, 16));

      return connectedAddress;

    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the connection request in MetaMask.');
      } else if (err.code === -32002) {
        setError('Connection request already pending. Please check MetaMask.');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
      
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setError(null);
    console.log('Wallet disconnected');
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    if (!address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Sign the message
      const signature = await signer.signMessage(message);
      
      console.log('Message signed successfully');
      return signature;

    } catch (err: any) {
      console.error('Error signing message:', err);
      
      if (err.code === 4001) {
        throw new Error('Signature rejected. Please approve the signature request in MetaMask.');
      } else {
        throw new Error(err.message || 'Failed to sign message');
      }
    }
  }, [address]);

  const switchChain = useCallback(async (targetChainId: number): Promise<void> => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });

      setChainId(targetChainId);
    } catch (err: any) {
      if (err.code === 4902) {
        throw new Error('Chain not added to MetaMask. Please add it manually.');
      } else {
        throw new Error(err.message || 'Failed to switch chain');
      }
    }
  }, []);

  return {
    address,
    isConnecting,
    isConnected: !!address,
    error,
    chainId,
    connectWallet,
    disconnectWallet,
    signMessage,
    switchChain,
    clearError
  };
}
