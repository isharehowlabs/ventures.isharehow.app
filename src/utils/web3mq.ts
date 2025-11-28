/**
 * Web3MQ Client Initialization and Utilities
 * Provides decentralized real-time messaging using Web3MQ protocol
 */

// Dynamic import to handle potential package issues
let Client: any = null;
try {
  const web3mqModule = require('@web3mq/client');
  Client = web3mqModule.Client || web3mqModule.default?.Client || web3mqModule;
} catch (error) {
  console.warn('Web3MQ client package not available:', error);
}

let web3mqClient: any | null = null;
let isInitializing = false;
let initPromise: Promise<string | null> | null = null;

export interface Web3MQConfig {
  appKey: string;
  env?: 'dev' | 'prod';
  didKey?: string;
  tempPubkey?: string;
  connectUrl?: string;
}

/**
 * Initialize Web3MQ client
 * @param config Web3MQ configuration
 * @returns Fast URL for connection or null if initialization fails
 */
export async function initWeb3MQ(config: Web3MQConfig): Promise<string | null> {
  if (!Client) {
    console.error('Web3MQ Client not available. Package may not be installed correctly.');
    return null;
  }

  // If already initializing, return the existing promise
  if (isInitializing && initPromise) {
    return initPromise;
  }

  // If client already exists, return stored fast URL
  if (web3mqClient) {
    const fastUrl = localStorage.getItem('WEB3MQ_FAST_URL');
    return fastUrl || null;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      // Get stored values or use provided config
      const tempPubkey = config.tempPubkey || localStorage.getItem('WEB3MQ_PUBLIC_KEY') || '';
      const didKey = config.didKey || localStorage.getItem('WEB3MQ_DID_KEY') || '';
      const connectUrl = config.connectUrl || localStorage.getItem('WEB3MQ_FAST_URL') || '';

      // Initialize Web3MQ client
      // Note: Web3MQ Client.init() API may vary - adjust based on actual package API
      const fastUrl = await Client.init({
        connectUrl,
        app_key: config.appKey,
        env: config.env || 'dev',
        didKey,
        tempPubkey,
      });

      // Store fast URL for future connections
      if (fastUrl) {
        localStorage.setItem('WEB3MQ_FAST_URL', fastUrl);
      }

      // Store other keys if provided
      if (config.tempPubkey) {
        localStorage.setItem('WEB3MQ_PUBLIC_KEY', config.tempPubkey);
      }
      if (config.didKey) {
        localStorage.setItem('WEB3MQ_DID_KEY', config.didKey);
      }

      // Get client instance
      web3mqClient = Client.getInstance ? Client.getInstance() : Client;
      isInitializing = false;
      return fastUrl;
    } catch (error) {
      console.error('Error initializing Web3MQ:', error);
      isInitializing = false;
      return null;
    }
  })();

  return initPromise;
}

/**
 * Get Web3MQ client instance
 * @returns Client instance or null if not initialized
 */
export function getWeb3MQClient(): any | null {
  if (!Client) return null;
  return web3mqClient || (Client.getInstance ? Client.getInstance() : null);
}

/**
 * Check if Web3MQ is initialized
 */
export function isWeb3MQInitialized(): boolean {
  if (!Client) return false;
  return web3mqClient !== null || (Client.getInstance ? Client.getInstance() !== null : false);
}

/**
 * Disconnect and cleanup Web3MQ client
 */
export function disconnectWeb3MQ(): void {
  if (web3mqClient) {
    try {
      web3mqClient.logout();
    } catch (error) {
      console.error('Error disconnecting Web3MQ:', error);
    }
    web3mqClient = null;
  }
  
  // Clear stored connection data
  localStorage.removeItem('WEB3MQ_FAST_URL');
  localStorage.removeItem('WEB3MQ_PUBLIC_KEY');
  localStorage.removeItem('WEB3MQ_DID_KEY');
  
  isInitializing = false;
  initPromise = null;
}

/**
 * Generate DID key for Web3MQ (using wallet address)
 * @param walletAddress Ethereum wallet address
 * @returns DID key string
 */
export function generateDIDKey(walletAddress: string): string {
  // Web3MQ uses wallet address as DID identifier
  // Format: did:key:wallet:0x...
  return `did:key:wallet:${walletAddress.toLowerCase()}`;
}

/**
 * Generate temporary public key for Web3MQ
 * This is a simplified version - in production, use proper key generation
 */
export function generateTempPubkey(): string {
  // Generate a random hex string (32 bytes = 64 hex chars)
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
