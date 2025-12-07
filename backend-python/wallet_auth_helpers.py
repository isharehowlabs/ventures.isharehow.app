"""
Web3 Wallet Authentication Helper Functions
Handles wallet-based login, signature verification, and ETH payment verification
"""
import os
import uuid
import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from eth_account.messages import encode_defunct
from web3 import Web3

# Nonce storage (in-memory - use Redis in production)
wallet_nonces = {}  # {address: {nonce: str, expires: timestamp}}

# Configuration
NONCE_EXPIRATION_SECONDS = 300  # 5 minutes
DASHBOARD_ACTIVATION_PRICE_USD = 17.99
ISHAREHOW_ETH_ADDRESS = os.environ.get('ISHAREHOW_ETH_ADDRESS', '0x0000000000000000000000000000000000000000')  # Set in env


def generate_nonce(address: str) -> str:
    """
    Generate a unique nonce for wallet authentication.
    
    Args:
        address: Ethereum wallet address
    
    Returns:
        Nonce string to be signed by the wallet
    """
    # Clean up expired nonces first
    cleanup_expired_nonces()
    
    # Generate unique nonce
    nonce = str(uuid.uuid4())
    expires = time.time() + NONCE_EXPIRATION_SECONDS
    
    # Normalize address
    address = address.lower()
    
    # Store nonce
    wallet_nonces[address] = {
        'nonce': nonce,
        'expires': expires
    }
    
    return nonce


def verify_nonce(address: str, nonce: str) -> bool:
    """
    Verify that a nonce exists and hasn't expired.
    
    Args:
        address: Ethereum wallet address
        nonce: Nonce to verify
    
    Returns:
        True if nonce is valid, False otherwise
    """
    address = address.lower()
    
    if address not in wallet_nonces:
        return False
    
    stored = wallet_nonces[address]
    
    # Check expiration
    if time.time() > stored['expires']:
        del wallet_nonces[address]
        return False
    
    # Check nonce matches
    return stored['nonce'] == nonce


def consume_nonce(address: str) -> None:
    """Remove nonce after successful use."""
    address = address.lower()
    if address in wallet_nonces:
        del wallet_nonces[address]


def cleanup_expired_nonces() -> None:
    """Remove all expired nonces from storage."""
    current_time = time.time()
    expired = [addr for addr, data in wallet_nonces.items() if current_time > data['expires']]
    for addr in expired:
        del wallet_nonces[addr]


def verify_wallet_signature(address: str, message: str, signature: str, w3: Web3) -> bool:
    """
    Verify an Ethereum signature.
    
    Args:
        address: Wallet address that supposedly signed the message
        message: Original message that was signed
        signature: Hex signature string
        w3: Web3 instance
    
    Returns:
        True if signature is valid, False otherwise
    """
    try:
        # Normalize address
        address = Web3.to_checksum_address(address)
        
        # Encode message for Ethereum signing
        encoded_message = encode_defunct(text=message)
        
        # Recover address from signature
        recovered_address = w3.eth.account.recover_message(encoded_message, signature=signature)
        
        # Compare addresses (case-insensitive)
        return recovered_address.lower() == address.lower()
    
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False


def generate_user_id_from_email(email: str, existing_usernames=None) -> str:
    """
    Generate username from email prefix.
    Ensures uniqueness by adding numeric suffix if needed.
    
    Args:
        email: Email address
        existing_usernames: Set or list of existing usernames to check against
    
    Returns:
        Unique username
    """
    if not email or '@' not in email:
        return f"user_{uuid.uuid4().hex[:8]}"
    
    # Extract prefix before @
    prefix = email.split('@')[0]
    
    # Clean up: lowercase, remove special chars, limit length
    username = ''.join(c for c in prefix if c.isalnum() or c in ['_', '-'])
    username = username.lower()[:20]
    
    # Ensure not empty
    if not username:
        username = f"user_{uuid.uuid4().hex[:8]}"
    
    # Check uniqueness
    if existing_usernames is None:
        return username
    
    # Add numeric suffix if needed
    if username not in existing_usernames:
        return username
    
    counter = 1
    while f"{username}{counter}" in existing_usernames:
        counter += 1
    
    return f"{username}{counter}"


def check_eth_payment_to_isharehow(address: str, w3: Web3, lookback_days: int = 30) -> Tuple[bool, Optional[float]]:
    """
    Check if a wallet has sent ETH payment to isharehow.eth address.
    
    Args:
        address: Wallet address to check
        w3: Web3 instance
        lookback_days: How many days to look back for transactions
    
    Returns:
        Tuple of (has_paid: bool, amount_usd: float or None)
    """
    try:
        # Normalize addresses
        from_address = Web3.to_checksum_address(address)
        to_address = Web3.to_checksum_address(ISHAREHOW_ETH_ADDRESS)
        
        # Get current block number
        current_block = w3.eth.block_number
        
        # Estimate blocks to look back (assuming ~12 second block time)
        blocks_per_day = (24 * 60 * 60) // 12
        lookback_blocks = blocks_per_day * lookback_days
        from_block = max(0, current_block - lookback_blocks)
        
        # Get transactions (this requires Alchemy Enhanced API or archive node)
        # For now, we'll use a simplified approach
        
        # Alternative: Check balance change or use Alchemy Transfer API
        # This is a placeholder - implement based on your Alchemy API access
        
        print(f"Checking ETH payments from {from_address} to {to_address}")
        print(f"Lookback: blocks {from_block} to {current_block}")
        
        # TODO: Implement actual transaction history check via Alchemy API
        # For now, return False
        return False, None
    
    except Exception as e:
        print(f"Error checking ETH payment: {e}")
        return False, None


def get_eth_price_usd() -> Optional[float]:
    """
    Get current ETH price in USD.
    Uses CoinGecko API (free tier).
    
    Returns:
        ETH price in USD or None if error
    """
    try:
        import requests
        response = requests.get(
            'https://api.coingecko.com/api/v3/simple/price',
            params={'ids': 'ethereum', 'vs_currencies': 'usd'},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            return data.get('ethereum', {}).get('usd')
        return None
    except Exception as e:
        print(f"Error fetching ETH price: {e}")
        return None


def calculate_eth_amount_for_usd(usd_amount: float) -> Optional[float]:
    """
    Calculate how much ETH equals a USD amount.
    
    Args:
        usd_amount: USD amount (e.g., 17.99)
    
    Returns:
        ETH amount or None if price unavailable
    """
    eth_price = get_eth_price_usd()
    if eth_price:
        return usd_amount / eth_price
    return None


def check_user_access_level(user) -> Dict[str, any]:
    """
    Determine user's access level and dashboard activation status.
    
    Access Rules:
    - Admin: Full access, no payment required
    - Employee: Full access, no payment required
    - User with Shopify subscription: Dashboard access
    - User with ETH payment: Dashboard access
    - User (free): Limited access
    
    Args:
        user: User object from database
    
    Returns:
        Dict with access information
    """
    # Check if admin
    if getattr(user, 'is_admin', False):
        return {
            'access_level': 'admin',
            'dashboard_enabled': True,
            'payment_required': False,
            'reason': 'Admin account'
        }
    
    # Check if employee
    if getattr(user, 'is_employee', False):
        return {
            'access_level': 'employee',
            'dashboard_enabled': True,
            'payment_required': False,
            'reason': 'Employee account'
        }
    
    # Check Shopify Bold subscription
    has_shopify_sub = (
        getattr(user, 'subscription_update_active', False) or
        getattr(user, 'membership_paid', False) or
        bool(getattr(user, 'bold_subscription_id', None))
    )
    
    if has_shopify_sub:
        return {
            'access_level': 'paid_user',
            'dashboard_enabled': True,
            'payment_required': False,
            'payment_method': 'shopify',
            'reason': 'Active Shopify subscription'
        }
    
    # Check ETH payment (stored in user model - need to add field)
    eth_payment_verified = getattr(user, 'eth_payment_verified', False)
    
    if eth_payment_verified:
        return {
            'access_level': 'paid_user',
            'dashboard_enabled': True,
            'payment_required': False,
            'payment_method': 'eth',
            'reason': 'ETH payment verified'
        }
    
    # Free user - limited access
    return {
        'access_level': 'free_user',
        'dashboard_enabled': False,
        'payment_required': True,
        'payment_options': {
            'shopify_url': '/api/shopify/subscribe',
            'eth_amount_usd': DASHBOARD_ACTIVATION_PRICE_USD,
            'eth_amount': calculate_eth_amount_for_usd(DASHBOARD_ACTIVATION_PRICE_USD),
            'eth_address': ISHAREHOW_ETH_ADDRESS
        },
        'reason': 'Payment required for dashboard access'
    }


def format_signing_message(nonce: str) -> str:
    """
    Format the message that users will sign with their wallet.
    
    Args:
        nonce: Unique nonce
    
    Returns:
        Formatted message string
    """
    return f"""Welcome to iShareHow Ventures!

Sign this message to authenticate your wallet.

This request will not trigger a blockchain transaction or cost any gas fees.

Nonce: {nonce}

By signing, you agree to our Terms of Service."""
