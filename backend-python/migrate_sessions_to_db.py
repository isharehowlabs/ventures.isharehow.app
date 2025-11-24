"""
One-time script to migrate existing users from UserProfile to User table.
Run this after deploying the new User model.

Usage:
    python migrate_sessions_to_db.py
"""
from app import app, db, User, UserProfile
from datetime import datetime

def migrate_sessions():
    """Migrate users from UserProfile to User table"""
    with app.app_context():
        if not db:
            print("✗ Database not available")
            return
        
        profiles = UserProfile.query.all()
        print(f"Found {len(profiles)} user profiles to migrate...")
        
        migrated_count = 0
        skipped_count = 0
        error_count = 0
        
        for profile in profiles:
            try:
                # Check if User already exists
                user = User.query.filter_by(patreon_id=profile.id).first()
                if not user:
                    # Create User from UserProfile
                    # Note: We don't have access_token/refresh_token from UserProfile,
                    # so those will be None. They'll be populated on next login.
                    user = User(
                        patreon_id=profile.id,
                        email=profile.email,
                        membership_active=profile.is_paid_member or False,
                        last_checked=datetime.utcnow() if profile.is_paid_member else None
                    )
                    db.session.add(user)
                    migrated_count += 1
                    print(f"✓ Migrated user: {profile.id} ({profile.email or 'no email'})")
                else:
                    # Update existing user with UserProfile data if needed
                    if not user.email and profile.email:
                        user.email = profile.email
                    if user.membership_active != (profile.is_paid_member or False):
                        user.membership_active = profile.is_paid_member or False
                    if not user.last_checked and profile.is_paid_member:
                        user.last_checked = datetime.utcnow()
                    skipped_count += 1
                    print(f"⊘ User already exists, updated if needed: {profile.id}")
            except Exception as e:
                error_count += 1
                print(f"✗ Error migrating user {profile.id}: {e}")
        
        try:
            db.session.commit()
            print(f"\n✓ Migration complete!")
            print(f"  - Migrated: {migrated_count}")
            print(f"  - Already existed: {skipped_count}")
            print(f"  - Errors: {error_count}")
        except Exception as e:
            print(f"\n✗ Error committing migration: {e}")
            db.session.rollback()

if __name__ == '__main__':
    migrate_sessions()

