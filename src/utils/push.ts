import { PushAPI, CONSTANTS } from '@pushprotocol/restapi';
import { ethers } from 'ethers';

// Singleton instance
let pushUserInstance: PushAPI | null = null;

/**
 * Initialize Push Protocol with a signer
 * @param signer - Ethers signer from wallet
 * @param env - Push environment (PROD, STAGING, DEV)
 * @returns Initialized PushAPI user instance
 */
export async function initPush(
  signer: ethers.Signer,
  env: typeof CONSTANTS.ENV[keyof typeof CONSTANTS.ENV] = CONSTANTS.ENV.PROD
): Promise<PushAPI> {
  if (pushUserInstance) {
    return pushUserInstance;
  }

  try {
    const user = await PushAPI.initialize(signer, { env });
    pushUserInstance = user;
    return user;
  } catch (error) {
    console.error('Failed to initialize Push Protocol:', error);
    throw error;
  }
}

/**
 * Get the current Push user instance
 * @throws Error if Push is not initialized
 */
export function getPushUser(): PushAPI {
  if (!pushUserInstance) {
    throw new Error('Push Protocol not initialized. Call initPush first.');
  }
  return pushUserInstance;
}

/**
 * Check if Push is initialized
 */
export function isPushInitialized(): boolean {
  return pushUserInstance !== null;
}

/**
 * Disconnect and cleanup Push Protocol
 */
export async function disconnectPush(): Promise<void> {
  if (pushUserInstance) {
    try {
      // Close any active streams
      if (pushUserInstance.stream) {
        await pushUserInstance.stream.disconnect();
      }
      pushUserInstance = null;
    } catch (error) {
      console.error('Error disconnecting Push Protocol:', error);
      pushUserInstance = null;
    }
  }
}

/**
 * Format an Ethereum address to CAIP format for Push Protocol
 * @param address - Ethereum address
 * @returns CAIP formatted address (eip155:0x...)
 */
export function formatAddressToCaip(address: string): string {
  // Remove any existing chain prefix
  const cleanAddress = address.replace(/^eip155:/, '');
  return `eip155:${cleanAddress}`;
}
