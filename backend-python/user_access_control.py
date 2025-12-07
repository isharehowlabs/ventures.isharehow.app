"""
User Access Control System
Defines user tiers, permissions, and dashboard access
"""
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional

class UserTier(Enum):
    """User tier levels with pricing and access"""
    PROSPECT = "prospect"           # Free 7-day trial
    USER = "user"                   # $17.99 - Rise + CoWork
    CLIENT_STARTER = "client_starter"  # $222 - 15 support requests/month
    CLIENT_PRO = "client_pro"       # $500+ - More requests
    CLIENT_ENTERPRISE = "client_enterprise"  # Custom pricing
    EMPLOYEE = "employee"           # Staff - Creative dashboard
    ADMIN = "admin"                 # Full access

class DashboardType(Enum):
    """Available dashboards"""
    RISE = "rise"                   # Rise Journey/Wellness
    COWORK = "cowork"               # CoWork/Productivity
    CREATIVE = "creative"           # Employee/Creative dashboard
    CLIENTS = "clients"             # Client management (CRM)
    PROSPECTS = "prospects"         # Prospect management
    SUPPORT = "support"             # Support request system
    ADMIN = "admin"                 # Admin panel

# Pricing configuration
PRICING = {
    UserTier.USER: {
        'price_usd': 17.99,
        'billing_cycle': 'monthly',
        'name': 'User',
        'description': 'Access to Rise and CoWork dashboards'
    },
    UserTier.CLIENT_STARTER: {
        'price_usd': 222.00,
        'billing_cycle': 'monthly',
        'name': 'Client Starter',
        'description': 'Up to 15 support requests per month',
        'max_requests': 15
    },
    UserTier.CLIENT_PRO: {
        'price_usd': 500.00,
        'billing_cycle': 'monthly',
        'name': 'Client Professional',
        'description': 'Up to 50 support requests per month',
        'max_requests': 50
    },
    UserTier.CLIENT_ENTERPRISE: {
        'price_usd': 1500.00,
        'billing_cycle': 'monthly',
        'name': 'Client Enterprise',
        'description': 'Unlimited support requests',
        'max_requests': None  # Unlimited
    },
    UserTier.PROSPECT: {
        'price_usd': 0.00,
        'trial_days': 7,
        'name': 'Prospect',
        'description': '7-day free trial'
    },
    UserTier.EMPLOYEE: {
        'price_usd': 0.00,
        'name': 'Employee',
        'description': 'Staff member'
    },
    UserTier.ADMIN: {
        'price_usd': 0.00,
        'name': 'Administrator',
        'description': 'Full system access'
    }
}

# Dashboard access by tier
TIER_DASHBOARD_ACCESS = {
    UserTier.PROSPECT: [
        DashboardType.RISE,
        DashboardType.COWORK,
        DashboardType.SUPPORT  # Trial of client features
    ],
    UserTier.USER: [
        DashboardType.RISE,
        DashboardType.COWORK
    ],
    UserTier.CLIENT_STARTER: [
        DashboardType.RISE,
        DashboardType.COWORK,
        DashboardType.SUPPORT
    ],
    UserTier.CLIENT_PRO: [
        DashboardType.RISE,
        DashboardType.COWORK,
        DashboardType.SUPPORT
    ],
    UserTier.CLIENT_ENTERPRISE: [
        DashboardType.RISE,
        DashboardType.COWORK,
        DashboardType.SUPPORT
    ],
    UserTier.EMPLOYEE: [
        DashboardType.RISE,
        DashboardType.COWORK,
        DashboardType.CREATIVE,
        DashboardType.CLIENTS,
        DashboardType.PROSPECTS,
        DashboardType.SUPPORT
    ],
    UserTier.ADMIN: [
        DashboardType.RISE,
        DashboardType.COWORK,
        DashboardType.CREATIVE,
        DashboardType.CLIENTS,
        DashboardType.PROSPECTS,
        DashboardType.SUPPORT,
        DashboardType.ADMIN
    ]
}


def get_user_tier(user) -> UserTier:
    """
    Determine user's tier based on their database attributes.
    
    Priority order:
    1. Admin (is_admin=True)
    2. Employee (is_employee=True)
    3. Client (has client record with payment >= $222)
    4. User (paid $17.99)
    5. Prospect (trial or no payment)
    """
    # Check admin first
    if getattr(user, 'is_admin', False):
        return UserTier.ADMIN
    
    # Check employee
    if getattr(user, 'is_employee', False):
        return UserTier.EMPLOYEE
    
    # Check if user is linked to a client record
    # This requires checking the clients table via user_id FK
    client_tier = _get_client_tier_from_db(user)
    if client_tier:
        return client_tier
    
    # Check if user paid for User tier ($17.99)
    has_user_payment = (
        getattr(user, 'subscription_update_active', False) or
        getattr(user, 'membership_paid', False) or
        getattr(user, 'eth_payment_verified', False)
    )
    
    if has_user_payment:
        # Check payment amount to determine if it's User or Client tier
        amount = _get_payment_amount(user)
        if amount >= 222.00:
            # Determine client tier by amount
            if amount >= 1500.00:
                return UserTier.CLIENT_ENTERPRISE
            elif amount >= 500.00:
                return UserTier.CLIENT_PRO
            else:
                return UserTier.CLIENT_STARTER
        else:
            return UserTier.USER
    
    # Check if prospect (has trial)
    if _is_trial_active(user):
        return UserTier.PROSPECT
    
    # Default: Prospect (not yet activated)
    return UserTier.PROSPECT


def _get_client_tier_from_db(user) -> Optional[UserTier]:
    """
    Check if user is linked to a Client record in clients table.
    This requires database access, so we'll return None for now
    and let the calling code handle it.
    """
    # TODO: Query clients table where user_id = user.id
    # For now, return None
    return None


def _get_payment_amount(user) -> float:
    """Get the payment amount from user record."""
    # Check ETH payment amount
    if getattr(user, 'eth_payment_amount', None):
        # Convert ETH to USD (would need current price)
        # For now, assume eth_payment_amount is already USD equivalent
        return float(getattr(user, 'eth_payment_amount', 0))
    
    # Check Shopify subscription tier
    # This would come from Bold Subscriptions API
    # For now, default to User tier amount
    return 17.99


def _is_trial_active(user) -> bool:
    """Check if user's trial period is still active."""
    trial_start = getattr(user, 'trial_start_date', None)
    if not trial_start:
        return False
    
    trial_end = trial_start + timedelta(days=7)
    return datetime.utcnow() < trial_end


def get_dashboard_access(user) -> Dict:
    """
    Get all dashboard access information for a user.
    
    Returns:
        Dict with tier, dashboards, limits, and trial info
    """
    tier = get_user_tier(user)
    dashboards = TIER_DASHBOARD_ACCESS.get(tier, [])
    pricing = PRICING.get(tier, {})
    
    # Check if trial is active (for prospects)
    is_trial = tier == UserTier.PROSPECT and _is_trial_active(user)
    trial_expires = None
    
    if is_trial:
        trial_start = getattr(user, 'trial_start_date', None)
        if trial_start:
            trial_expires = trial_start + timedelta(days=7)
    
    # Get support request limits (for clients)
    max_requests = None
    if tier in [UserTier.CLIENT_STARTER, UserTier.CLIENT_PRO, UserTier.CLIENT_ENTERPRISE]:
        max_requests = pricing.get('max_requests')
    
    return {
        'tier': tier.value,
        'tier_name': pricing.get('name', tier.value),
        'tier_description': pricing.get('description', ''),
        'price_usd': pricing.get('price_usd', 0),
        'dashboards': [d.value for d in dashboards],
        'dashboard_access': {
            'rise': DashboardType.RISE in dashboards,
            'cowork': DashboardType.COWORK in dashboards,
            'creative': DashboardType.CREATIVE in dashboards,
            'clients': DashboardType.CLIENTS in dashboards,
            'prospects': DashboardType.PROSPECTS in dashboards,
            'support': DashboardType.SUPPORT in dashboards,
            'admin': DashboardType.ADMIN in dashboards
        },
        'is_trial': is_trial,
        'trial_expires': trial_expires.isoformat() if trial_expires else None,
        'max_support_requests': max_requests,
        'can_manage_clients': tier in [UserTier.EMPLOYEE, UserTier.ADMIN],
        'can_manage_employees': tier == UserTier.ADMIN,
        'is_paying': tier not in [UserTier.PROSPECT] and pricing.get('price_usd', 0) > 0
    }


def can_access_dashboard(user, dashboard: str) -> bool:
    """Check if user can access a specific dashboard."""
    access = get_dashboard_access(user)
    return access['dashboard_access'].get(dashboard, False)


def get_support_request_limit(user) -> Optional[int]:
    """
    Get the support request limit for a user.
    
    Returns:
        None (unlimited), 0 (no access), or positive integer (limit)
    """
    tier = get_user_tier(user)
    
    # No access for non-clients
    if tier not in [UserTier.PROSPECT, UserTier.CLIENT_STARTER, 
                    UserTier.CLIENT_PRO, UserTier.CLIENT_ENTERPRISE]:
        return 0
    
    # Check if trial expired for prospects
    if tier == UserTier.PROSPECT:
        if not _is_trial_active(user):
            return 0
        # During trial, give same limit as Starter
        return PRICING[UserTier.CLIENT_STARTER]['max_requests']
    
    # Return tier limit
    return PRICING[tier].get('max_requests')


def start_trial(user) -> datetime:
    """
    Start a 7-day trial for a prospect.
    
    Returns:
        Trial expiration datetime
    """
    trial_start = datetime.utcnow()
    trial_expires = trial_start + timedelta(days=7)
    
    # Update user record (calling code should save this)
    user.trial_start_date = trial_start
    user.auth_provider = UserTier.PROSPECT.value
    
    return trial_expires


def upgrade_tier(user, new_tier: UserTier, payment_amount: float = None) -> bool:
    """
    Upgrade user to a new tier.
    
    Args:
        user: User object
        new_tier: Target tier
        payment_amount: Payment amount (for validation)
    
    Returns:
        True if upgrade successful
    """
    current_tier = get_user_tier(user)
    
    # Validate upgrade path
    tier_hierarchy = [
        UserTier.PROSPECT,
        UserTier.USER,
        UserTier.CLIENT_STARTER,
        UserTier.CLIENT_PRO,
        UserTier.CLIENT_ENTERPRISE,
        UserTier.EMPLOYEE,
        UserTier.ADMIN
    ]
    
    # Check if upgrade is valid
    if new_tier not in tier_hierarchy:
        return False
    
    # Validate payment amount matches tier
    required_amount = PRICING.get(new_tier, {}).get('price_usd', 0)
    if payment_amount and payment_amount < required_amount:
        return False
    
    # Update user tier (calling code should save)
    if new_tier == UserTier.ADMIN:
        user.is_admin = True
    elif new_tier == UserTier.EMPLOYEE:
        user.is_employee = True
    elif new_tier == UserTier.USER:
        user.membership_paid = True
        user.subscription_update_active = True
    elif new_tier in [UserTier.CLIENT_STARTER, UserTier.CLIENT_PRO, UserTier.CLIENT_ENTERPRISE]:
        user.membership_paid = True
        user.subscription_update_active = True
        # Additional: Create/update client record
    
    return True


def get_upgrade_options(user) -> List[Dict]:
    """
    Get available upgrade options for a user.
    
    Returns:
        List of upgrade tier options with pricing
    """
    current_tier = get_user_tier(user)
    options = []
    
    # Define upgrade paths
    if current_tier == UserTier.PROSPECT:
        options = [UserTier.USER, UserTier.CLIENT_STARTER]
    elif current_tier == UserTier.USER:
        options = [UserTier.CLIENT_STARTER, UserTier.CLIENT_PRO, UserTier.CLIENT_ENTERPRISE]
    elif current_tier == UserTier.CLIENT_STARTER:
        options = [UserTier.CLIENT_PRO, UserTier.CLIENT_ENTERPRISE]
    elif current_tier == UserTier.CLIENT_PRO:
        options = [UserTier.CLIENT_ENTERPRISE]
    
    # Format options
    return [
        {
            'tier': tier.value,
            'name': PRICING[tier]['name'],
            'description': PRICING[tier]['description'],
            'price_usd': PRICING[tier]['price_usd'],
            'features': TIER_DASHBOARD_ACCESS[tier]
        }
        for tier in options
    ]
