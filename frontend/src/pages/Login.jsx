import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/api';
import { Droplets, Eye, EyeOff, Mail, Lock } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await auth.login(form.email, form.password);
      if (res.error) {
        setError(res.error.message || 'Login failed');
      } else if (res.data) {
        login(res.data.user, res.data.profile);
        navigate('/dashboard');
      } else {
        setError('Unexpected response from server');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Sidebar */}
      <div className="auth-sidebar">
        <div className="auth-sidebar-content">
          <div className="auth-logo">
            <Droplets size={56} strokeWidth={1.5} />
          </div>
          <h1>AquaShare</h1>
          <p>
            Connecting communities with trusted water suppliers.
            Request, track, and communicate — all in one place.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="auth-main">
        <div className="auth-form-wrapper animate-in">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your AquaShare account</p>
          </div>

          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '.875rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-500)',
                }} />
                <input
                  id="login-email"
                  className={`form-input ${error ? 'error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  style={{ paddingLeft: '42px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--gray-500)',
                }} />
                <input
                  id="login-password"
                  className={`form-input ${error ? 'error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--gray-500)',
                    padding: '4px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Signing in…
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="auth-form-footer">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
