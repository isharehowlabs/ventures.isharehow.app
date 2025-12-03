import { useState, useEffect, useCallback } from 'react';
import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import { initPush, getPushUser, disconnectPush, formatAddressToCaip, isPushInitialized } from '../utils/push';

export interface PushMessage {
  fromDID: string;
  toDID: string;
  messageContent: string;
  timestamp: number;
  messageType: string;
  signature?: string;
  fromCAIP10: string;
  toCAIP10: string;
}

export interface UsePushChatReturn {
  isConnected: boolean;
  isInitializing: boolean;
  error: string | null;
  messages: PushMessage[];
  user: PushAPI | null;
  initialize: () => Promise<void>;
  sendMessage: (to: string, content: string) => Promise<void>;
  disconnect: () => Promise<void>;
  clearError: () => void;
}

export function usePushChat(): UsePushChatReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const [user, setUser] = useState<PushAPI | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initialize = useCallback(async () => {
    if (isInitializing || isConnected) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Check for ethereum provider
      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create ethers provider and signer (ethers v6)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Initialize Push Protocol
      const pushUser = await initPush(signer, CONSTANTS.ENV.PROD);
      setUser(pushUser);

      // Initialize stream for real-time chat updates
      const stream = await pushUser.initStream([
        CONSTANTS.STREAM.CHAT,
        CONSTANTS.STREAM.CONNECT,
        CONSTANTS.STREAM.DISCONNECT,
      ]);

      // Set up event listeners
      stream.on(CONSTANTS.STREAM.CONNECT, () => {
        console.log('Push Protocol stream connected');
        setIsConnected(true);
      });

      stream.on(CONSTANTS.STREAM.DISCONNECT, () => {
        console.log('Push Protocol stream disconnected');
        setIsConnected(false);
      });

      stream.on(CONSTANTS.STREAM.CHAT, (message: any) => {
        console.log('Received chat message:', message);
        
        // Add message to state
        setMessages((prev) => [...prev, {
          fromDID: message.from || '',
          toDID: message.to || '',
          messageContent: message.message?.content || '',
          timestamp: message.timestamp || Date.now(),
          messageType: message.message?.type || 'Text',
          fromCAIP10: message.fromCAIP10 || message.from || '',
          toCAIP10: message.toCAIP10 || message.to || '',
        }]);
      });

      // Connect the stream
      await stream.connect();

      setIsConnected(true);
    } catch (err: any) {
      console.error('Failed to initialize Push Chat:', err);
      setError(err.message || 'Failed to initialize Push Chat');
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing, isConnected]);

  const sendMessage = useCallback(async (to: string, content: string) => {
    if (!user) {
      setError('Push Protocol not initialized');
      return;
    }

    try {
      const recipient = formatAddressToCaip(to);
      
      await user.chat.send(recipient, {
        type: 'Text',
        content,
      });

      console.log('Message sent successfully to:', recipient);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      throw err;
    }
  }, [user]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectPush();
      setUser(null);
      setIsConnected(false);
      setMessages([]);
      setError(null);
    } catch (err: any) {
      console.error('Failed to disconnect:', err);
      setError(err.message || 'Failed to disconnect');
    }
  }, []);

  // Auto-initialize on mount if wallet is available
  useEffect(() => {
    if (window.ethereum && !isPushInitialized()) {
      // Auto-init can be triggered here or wait for user action
      // For now, we'll wait for explicit initialize call
    }
  }, []);

  return {
    isConnected,
    isInitializing,
    error,
    messages,
    user,
    initialize,
    sendMessage,
    disconnect,
    clearError,
  };
}
