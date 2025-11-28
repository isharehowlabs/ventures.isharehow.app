/**
 * React Hook for Web3MQ Integration
 * Provides Web3MQ client management and messaging functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { initWeb3MQ, getWeb3MQClient, isWeb3MQInitialized, disconnectWeb3MQ, generateDIDKey, generateTempPubkey, Web3MQConfig } from '../utils/web3mq';
import { useAuth } from './useAuth';

export interface Web3MQMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  channelId?: string;
}

export interface UseWeb3MQReturn {
  client: any | null;
  isConnected: boolean;
  isInitializing: boolean;
  error: string | null;
  messages: Web3MQMessage[];
  initialize: (config?: Partial<Web3MQConfig>) => Promise<boolean>;
  sendMessage: (content: string, channelId?: string) => Promise<boolean>;
  disconnect: () => void;
  clearError: () => void;
}

export function useWeb3MQ(): UseWeb3MQReturn {
  const { user } = useAuth();
  const [client, setClient] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Web3MQMessage[]>([]);

  // Get Web3MQ app key from environment
  const getAppKey = (): string => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_WEB3MQ_APP_KEY || '';
    }
    return '';
  };

  // Initialize Web3MQ client
  const initialize = useCallback(async (config?: Partial<Web3MQConfig>): Promise<boolean> => {
    if (isInitializing) {
      return false;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const appKey = config?.appKey || getAppKey();
      if (!appKey) {
        setError('Web3MQ app key not configured. Set NEXT_PUBLIC_WEB3MQ_APP_KEY environment variable.');
        setIsInitializing(false);
        return false;
      }

      // Generate DID key from user's wallet address or ENS name
      let didKey: string | undefined;
      let tempPubkey: string | undefined;

      if (user?.cryptoAddress) {
        didKey = generateDIDKey(user.cryptoAddress);
      } else if (user?.ensName) {
        // Use ENS name as identifier
        didKey = `did:key:ens:${user.ensName}`;
      } else {
        // Generate temporary key if no wallet available
        tempPubkey = generateTempPubkey();
      }

      const fastUrl = await initWeb3MQ({
        appKey,
        env: config?.env || 'dev',
        didKey,
        tempPubkey,
        connectUrl: config?.connectUrl,
      });

      if (fastUrl) {
        const clientInstance = getWeb3MQClient();
        if (clientInstance) {
          setClient(clientInstance);
          setIsConnected(true);
          setIsInitializing(false);
          return true;
        }
      }

      setError('Failed to initialize Web3MQ client');
      setIsInitializing(false);
      return false;
    } catch (err: any) {
      console.error('Error initializing Web3MQ:', err);
      setError(err.message || 'Failed to initialize Web3MQ');
      setIsInitializing(false);
      return false;
    }
  }, [user, isInitializing]);

  // Send message
  const sendMessage = useCallback(async (content: string, channelId?: string): Promise<boolean> => {
    if (!client || !isConnected) {
      setError('Web3MQ client not connected');
      return false;
    }

    try {
      // Web3MQ message sending implementation
      // This will be implemented based on Web3MQ SDK API
      // For now, this is a placeholder
      console.log('Sending message via Web3MQ:', { content, channelId });
      
      // TODO: Implement actual Web3MQ message sending
      // await client.sendMessage({ content, channelId });
      
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
      return false;
    }
  }, [client, isConnected]);

  // Disconnect
  const disconnect = useCallback(() => {
    disconnectWeb3MQ();
    setClient(null);
    setIsConnected(false);
    setMessages([]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-initialize if user has wallet address
  useEffect(() => {
    if (user?.cryptoAddress && !isWeb3MQInitialized() && !isInitializing) {
      initialize();
    }
  }, [user?.cryptoAddress, initialize, isInitializing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, disconnect]);

  return {
    client,
    isConnected,
    isInitializing,
    error,
    messages,
    initialize,
    sendMessage,
    disconnect,
    clearError,
  };
}
