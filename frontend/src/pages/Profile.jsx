import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { user as userApi } from '../services/api';
import {
  User, Mail, Phone, MapPin, Landmark, Save, Lock, Eye, EyeOff, CheckCircle
} from 'lucide-react';

export default function Profile() {
  const { user, profile, role, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form
  const [profileForm, setProfileForm] = useState({
    address: profile?.address || '',
    landmark: profile?.landmark || '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [showPass, setShowPass] = useState(false);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
    setSuccess('');
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setSuccess('');
    setError('');
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await userApi.createProfile({
        address: profileForm.address,
        landmark: profileForm.landmark,
      });
      if (res.error) {
        setError(res.error.message || 'Failed to save profile');
      } else {
        updateProfile({ ...profile, ...profileForm });
        setSuccess('Profile updated successfully!');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!passwordForm.current || !passwordForm.newPass) {
      return setError('All fields are required');
    }
    if (passwordForm.newPass.length < 6) {
      return setError('New password must be at least 6 characters');
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      return setError('New passwords do not match');
    }
    setSuccess('Password updated successfully!');
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'password', label: 'Security', icon: Lock },
  ];

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '28px' }}>
        <h2>Account Settings</h2>
        <p className="text-muted">Manage your profile and security</p>
      </div>

      {/* User Info Card */}
      <div className="card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className="avatar avatar-lg">{initials}</div>
        <div>
          <h3>{user?.full_name}</h3>
          <div className="text-sm text-muted" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={14} /> {user?.email || 'No email'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={14} /> {user?.phone || 'No phone'}
            </span>
          </div>
          <span className="chip" style={{ marginTop: '8px', textTransform: 'capitalize' }}>{role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        borderBottom: '2px solid var(--gray-200)', paddingBottom: '0',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className="btn btn-ghost"
            onClick={() => { setActiveTab(tab.key); setError(''); setSuccess(''); }}
            style={{
              borderBottom: activeTab === tab.key ? '2px solid var(--primary-500)' : '2px solid transparent',
              borderRadius: 0,
              color: activeTab === tab.key ? 'var(--primary-600)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.key ? 600 : 400,
              marginBottom: '-2px',
            }}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {success && (
        <div style={{
          background: '#e8f5e9', color: '#2e7d32',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          fontSize: '.875rem', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <CheckCircle size={18} /> {success}
        </div>
      )}
      {error && (
        <div style={{
          background: '#ffebee', color: '#c62828',
          padding: '12px 16px', borderRadius: 'var(--radius-md)',
          fontSize: '.875rem', marginBottom: '20px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-address">Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-500)',
                }} />
                <input
                  id="profile-address"
                  className="form-input"
                  name="address"
                  placeholder="Your street address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-landmark">Landmark</label>
              <div style={{ position: 'relative' }}>
                <Landmark size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-500)',
                }} />
                <input
                  id="profile-landmark"
                  className="form-input"
                  name="landmark"
                  placeholder="Nearby landmark (e.g. Next to Market)"
                  value={profileForm.landmark}
                  onChange={handleProfileChange}
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Saving…
                </>
              ) : (
                <><Save size={16} /> Save Changes</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card">
          <form onSubmit={savePassword}>
            <div className="form-group">
              <label className="form-label" htmlFor="pass-current">Current Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-500)',
                }} />
                <input
                  id="pass-current"
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  name="current"
                  placeholder="Current password"
                  value={passwordForm.current}
                  onChange={handlePasswordChange}
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: '4px',
                  }}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pass-new">New Password</label>
              <input
                id="pass-new"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                name="newPass"
                placeholder="At least 6 characters"
                value={passwordForm.newPass}
                onChange={handlePasswordChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pass-confirm">Confirm New Password</label>
              <input
                id="pass-confirm"
                className="form-input"
                type={showPass ? 'text' : 'password'}
                name="confirm"
                placeholder="Re-enter new password"
                value={passwordForm.confirm}
                onChange={handlePasswordChange}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              <Lock size={16} /> Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
