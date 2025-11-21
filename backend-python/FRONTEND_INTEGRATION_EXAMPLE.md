# Frontend Integration Guide for Profile Management

## Overview
This guide shows how to integrate the profile management API into your frontend application. The profile button should be available on all pages so users can view and update their profile information.

## React/Next.js Example

### 1. Create a Profile Hook

```typescript
// hooks/useProfile.ts
import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  patreonId: string;
  membershipTier: string;
  isPaidMember: boolean;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setError(null);
      } else {
        setProfile(null);
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Network error');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { email?: string; name?: string }) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        return { success: true, data };
      } else {
        const error = await res.json();
        return { success: false, error: error.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
}
```

### 2. Create a Profile Button Component

```typescript
// components/ProfileButton.tsx
import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';

export function ProfileButton() {
  const { profile, loading } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  if (loading || !profile) {
    return (
      <button className="profile-button loading">
        Loading...
      </button>
    );
  }

  return (
    <div className="profile-container">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="profile-button"
      >
        {profile.avatarUrl && (
          <img src={profile.avatarUrl} alt={profile.name} />
        )}
        <span>{profile.name}</span>
      </button>
      
      {isOpen && <ProfileDropdown profile={profile} onClose={() => setIsOpen(false)} />}
    </div>
  );
}
```

### 3. Create a Profile Dropdown/Modal

```typescript
// components/ProfileDropdown.tsx
import { useState } from 'react';
import { useProfile } from '../hooks/useProfile';

interface Props {
  profile: any;
  onClose: () => void;
}

export function ProfileDropdown({ profile, onClose }: Props) {
  const { updateProfile } = useProfile();
  const [email, setEmail] = useState(profile.email);
  const [name, setName] = useState(profile.name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    const result = await updateProfile({ email, name });
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage(`Error: ${result.error}`);
    }
    
    setSaving(false);
  };

  return (
    <div className="profile-dropdown">
      <div className="profile-header">
        <h3>Profile Settings</h3>
        <button onClick={onClose}>×</button>
      </div>
      
      <div className="profile-content">
        <div className="profile-avatar">
          <img src={profile.avatarUrl} alt={name} />
        </div>
        
        <div className="form-group">
          <label>Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="profile-info">
          <p><strong>Membership:</strong> {profile.membershipTier || 'None'}</p>
          <p><strong>Status:</strong> {profile.isPaidMember ? 'Paid Member' : 'Free'}</p>
        </div>
        
        {message && <div className="message">{message}</div>}
        
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="save-button"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
```

### 4. Add to Layout/Header

```typescript
// components/Layout.tsx
import { ProfileButton } from './ProfileButton';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="logo">Your App</div>
        <nav>
          {/* Your navigation items */}
        </nav>
        <ProfileButton />
      </header>
      
      <main>{children}</main>
    </div>
  );
}
```

## Vanilla JavaScript Example

```html
<!-- Profile button in your HTML -->
<div id="profile-container"></div>

<script>
async function loadProfile() {
  try {
    const res = await fetch('/api/profile', {
      credentials: 'include'
    });
    
    if (res.ok) {
      const profile = await res.json();
      displayProfileButton(profile);
    } else {
      // User not logged in
      displayLoginButton();
    }
  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

function displayProfileButton(profile) {
  const container = document.getElementById('profile-container');
  container.innerHTML = `
    <div class="profile-button" onclick="openProfileModal()">
      <img src="${profile.avatarUrl}" alt="${profile.name}">
      <span>${profile.name}</span>
    </div>
  `;
}

function openProfileModal() {
  // Create and show modal with profile editing form
  // Similar to the React example above
}

async function updateProfile(email, name) {
  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, name })
    });
    
    if (res.ok) {
      const updated = await res.json();
      alert('Profile updated successfully!');
      loadProfile(); // Reload profile data
    } else {
      const error = await res.json();
      alert('Error: ' + error.error);
    }
  } catch (err) {
    alert('Network error');
  }
}

// Load profile on page load
document.addEventListener('DOMContentLoaded', loadProfile);
</script>
```

## CSS Styling Example

```css
.profile-container {
  position: relative;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
}

.profile-button:hover {
  background: #f5f5f5;
}

.profile-button img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 300px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 16px;
  z-index: 1000;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.save-button {
  width: 100%;
  padding: 10px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.save-button:hover {
  background: #0051cc;
}

.save-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

## Important Notes

1. **Always include `credentials: 'include'`** in fetch requests to send session cookies
2. **Handle authentication errors** (401) by redirecting to login page
3. **Validate input** on the frontend before submitting
4. **Show loading states** while fetching or updating data
5. **Display error messages** clearly to users
6. **Update local state** after successful profile updates

## Login Flow

Users should authenticate via Patreon OAuth:
```javascript
// Redirect to Patreon login
window.location.href = '/api/auth/patreon/login';

// After successful login, user is redirected back with session cookie
// Then you can call /api/profile to get their data
```
