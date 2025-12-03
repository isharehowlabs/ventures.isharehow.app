# Push Protocol Chat Setup

## Overview
Your application has been successfully migrated from Web3MQ to Push Protocol for real-time wallet-to-wallet messaging and notifications on Ethereum.

## What Was Implemented

### 1. New Files Created
- `src/utils/push.ts` - Push Protocol utility functions (init, disconnect, address formatting)
- `src/hooks/usePushChat.ts` - React hook for Push Protocol chat functionality
- `src/components/chat/PushChat.tsx` - Chat component
- `src/components/chat/FloatingPushChat.tsx` - Floating chat widget
- `src/types/window.d.ts` - TypeScript declarations for Web3 wallet

### 2. Updated Files
- `src/pages/labs.tsx` - Now uses PushChat component
- `src/pages/cowork.tsx` - Now uses FloatingPushChat component

### 3. Dependencies Installed
- `@pushprotocol/restapi` - Push Protocol SDK
- `ethers` - Ethereum library for wallet interaction

## How It Works

### User Flow
1. User clicks "Connect Push Protocol" button in the chat interface
2. MetaMask (or another Web3 wallet) prompts for wallet connection
3. Push Protocol initializes with the user's wallet signer
4. Real-time stream connects for receiving messages
5. User can send messages to any Ethereum address

### Key Features
- ✅ Real-time message streaming (no polling needed)
- ✅ Wallet-to-wallet messaging using Ethereum addresses
- ✅ Automatic reconnection handling
- ✅ Message history display
- ✅ Visual connection status indicator
- ✅ Support for MetaMask and Para wallets

## Configuration

### Setting Peer Addresses
Currently, the chat components are configured with a placeholder address:
```tsx
peerAddress="0x0000000000000000000000000000000000000000"
```

**To enable actual messaging, update these to real Ethereum addresses:**

In `src/pages/labs.tsx`:
```tsx
<PushChat
  peerAddress="0xYourRecipientAddressHere"
  chatName="Labs Chat"
  compact={true}
/>
```

In `src/pages/cowork.tsx`:
```tsx
<FloatingPushChat
  peerAddress="0xYourRecipientAddressHere"
  chatName="Co-Work Chat"
  position="bottom-right"
/>
```

### Environment
The chat is configured to use Push Protocol's **production environment** on Ethereum mainnet.

To use staging/testnet:
- Edit `src/hooks/usePushChat.ts`
- Change `CONSTANTS.ENV.PROD` to `CONSTANTS.ENV.STAGING`

## Usage Examples

### Basic Chat Component
```tsx
import PushChat from '../components/chat/PushChat';

<PushChat
  peerAddress="0x1234..." // Recipient's Ethereum address
  chatName="My Chat"
/>
```

### Floating Chat Widget
```tsx
import FloatingPushChat from '../components/chat/FloatingPushChat';

<FloatingPushChat
  peerAddress="0x1234..."
  chatName="Support Chat"
  position="bottom-right" // or "bottom-left" or "bottom-center"
/>
```

### Using the Hook Directly
```tsx
import { usePushChat } from '../hooks/usePushChat';

function MyComponent() {
  const { isConnected, messages, initialize, sendMessage } = usePushChat();
  
  // Initialize when needed
  useEffect(() => {
    initialize();
  }, []);
  
  // Send a message
  const handleSend = async () => {
    await sendMessage('0x1234...', 'Hello!');
  };
}
```

## Group Chat / Channel Support

For group chats or public channels, you'll need to:

1. **Create a Push Protocol Group**:
   ```typescript
   const group = await user.chat.group.create('Group Name', {
     description: 'Group description',
     members: ['0xAddress1', '0xAddress2'],
     admins: ['0xYourAddress'],
   });
   ```

2. **Update the chat component** to handle group chat IDs instead of peer addresses

3. **Subscribe to group updates** in the stream handlers

Refer to [Push Protocol Docs](https://docs.push.org/developers/developer-guides/chat/) for detailed group chat implementation.

## Troubleshooting

### "No Web3 wallet detected"
- Ensure MetaMask or another Web3 wallet extension is installed
- Check that the wallet is unlocked

### "Failed to initialize Push Chat"
- Check browser console for detailed error messages
- Verify the wallet is connected to the correct network
- Ensure you have a stable internet connection

### Messages not appearing
- Verify the peer address is correct and checksummed
- Check that both sender and receiver have initialized Push Protocol
- Look for errors in the browser console

### Build Errors
If you encounter TypeScript errors:
```bash
npm run build
```

If packages are missing:
```bash
npm install
```

## Next Steps

### Optional: Server-Side Notifications (Python)
To send push notifications from your Flask backend:

1. **Install Python packages**:
   ```bash
   pip install eth-account web3 requests
   ```

2. **Create notification sender**:
   ```python
   from eth_account import Account
   from eth_account.messages import encode_typed_data
   import requests
   
   # Your channel private key (keep secure!)
   channel_private_key = "0x..."
   account = Account.from_key(channel_private_key)
   
   # Send notification
   def send_push_notification(recipient, title, body):
       # EIP-712 signing and Push API call
       # See Push Protocol docs for full implementation
       pass
   ```

3. **Reference**: [Push Protocol Notification Docs](https://docs.push.org/developers/developer-guides/sending-notifications)

## Resources

- [Push Protocol Documentation](https://docs.push.org/)
- [Push Protocol Chat Guide](https://docs.push.org/developers/developer-guides/chat/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Push Protocol GitHub](https://github.com/push-protocol)

## Migration Complete ✅

Your application now uses Push Protocol instead of Web3MQ. The old Web3MQ files remain in place (with `.bak` backups) but are no longer in use.
