"""
Scheduled script to verify Patreon membership status for all users.
Run twice monthly via Render Cron Job.
"""
import os
import sys
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv

# Add parent directory to path to import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User
from app import refresh_patreon_token

load_dotenv()

def verify_user_membership(user):
    """Verify a single user's membership status"""
    if not user.access_token:
        print(f"⚠ User {user.patreon_id} has no access token")
        return False
    
    headers = {
        'Authorization': f'Bearer {user.access_token}',
        'User-Agent': 'VenturesApp/1.0 (+https://ventures.isharehow.app)'
    }
    
    # Check if token is expired
    if user.token_expires_at and user.token_expires_at < datetime.utcnow():
        print(f"⚠ Token expired for {user.patreon_id}, attempting refresh...")
        # Try to refresh token
        if user.refresh_token:
            new_token_data = refresh_patreon_token(user.refresh_token)
            if new_token_data:
                user.access_token = new_token_data.get('access_token')
                if new_token_data.get('refresh_token'):
                    user.refresh_token = new_token_data.get('refresh_token')
                expires_in = new_token_data.get('expires_in', 3600)
                user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                headers['Authorization'] = f'Bearer {user.access_token}'
                print(f"✓ Token refreshed for {user.patreon_id}")
            else:
                print(f"✗ Failed to refresh token for {user.patreon_id}")
                return False
        else:
            print(f"✗ No refresh token for {user.patreon_id}")
            return False
    
    try:
        identity_url = (
            "https://www.patreon.com/api/oauth2/v2/identity"
            "?fields[user]=id,email,full_name,image_url"
            "&include=memberships"
            "&fields[member]=patron_status,currently_entitled_amount_cents,last_charge_date,pledge_start"
        )
        
        response = requests.get(identity_url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Parse membership status
        is_active = False
        user_data = data.get('data', {})
        relationships = user_data.get('relationships', {})
        memberships = relationships.get('memberships', {}).get('data', [])
        
        if memberships:
            included = data.get('included', [])
            for membership in memberships:
                membership_id = membership.get('id')
                for item in included:
                    if item.get('id') == membership_id and item.get('type') == 'member':
                        member_attrs = item.get('attributes', {})
                        patron_status = member_attrs.get('patron_status')
                        if patron_status == 'active_patron':
                            is_active = True
                            break
        
        # Special handling for creator/admin
        if user.patreon_id == '56776112':
            is_active = False
        
        # Update user
        user.membership_active = is_active
        user.last_checked = datetime.utcnow()
        db.session.commit()
        
        status = "✓" if is_active else "✗"
        print(f"{status} User {user.patreon_id}: membership_active={is_active}")
        return True
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            print(f"✗ Token invalid for {user.patreon_id} - may need re-authentication")
        else:
            print(f"✗ HTTP error for {user.patreon_id}: {e}")
        return False
    except Exception as e:
        print(f"✗ Error verifying {user.patreon_id}: {e}")
        return False

def main():
    """Main verification function"""
    with app.app_context():
        if not db:
            print("✗ Database not available")
            return 1
        
        users = User.query.all()
        print(f"Verifying {len(users)} users...")
        
        success_count = 0
        for user in users:
            if verify_user_membership(user):
                success_count += 1
        
        print(f"\n✓ Verified {success_count}/{len(users)} users successfully")
        return 0 if success_count == len(users) else 1

if __name__ == '__main__':
    sys.exit(main())

