import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { Droplets, User, Phone, Mail, Lock, Eye, EyeOff, MapPin, ChevronRight, Check } from 'lucide-react';

const STEPS = ['Account Type', 'Personal Info', 'Security'];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    role: 'resident',
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.name.trim()) return setError('Full name is required');
      if (!form.phone.trim()) return setError('Phone number is required');
      if (form.email && !/\S+@\S+\.\S+/.test(form.email)) return setError('Invalid email address');
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.password || form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await auth.register({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      if (res.error) {
        setError(res.error.message || 'Registration failed');
      } else if (res.data !== undefined) {
        navigate('/login', { state: { registered: true } });
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
          <h1>Join AquaShare</h1>
          <p>
            Whether you need water or supply it — AquaShare brings
            your community together for reliable water access.
          </p>

          {/* Stepper */}
          <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                opacity: i <= step ? 1 : 0.4,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i < step ? 'rgba(255,255,255,.3)' : i === step ? 'var(--white)' : 'rgba(255,255,255,.1)',
                  color: i === step ? 'var(--primary-700)' : 'var(--white)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.8125rem', fontWeight: 700,
                  transition: 'all .3s ease',
                }}>
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: '.9375rem', fontWeight: i === step ? 600 : 400 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="auth-main">
        <div className="auth-form-wrapper animate-in">
          <div className="auth-form-header">
            <h2>Create your account</h2>
            <p>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>

          {error && (
            <div style={{
              background: '#ffebee', color: '#c62828',
              padding: '12px 16px', borderRadius: 'var(--radius-md)',
              fontSize: '.875rem', marginBottom: '20px',
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* STEP 0 — Role Selection */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  {
                    value: 'resident',
                    title: 'I need water',
                    desc: 'Sign up as a resident to find and request water from local suppliers.',
                    icon: '🏠',
                  },
                  {
                    value: 'supplier',
                    title: 'I supply water',
                    desc: 'Sign up as a supplier to reach residents in your area.',
                    icon: '🚰',
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '20px', borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${form.role === opt.value ? 'var(--primary-500)' : 'var(--gray-200)'}`,
                      background: form.role === opt.value ? 'var(--primary-50)' : 'var(--white)',
                      cursor: 'pointer', transition: 'all .2s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={form.role === opt.value}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '2rem' }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: '.8125rem', color: 'var(--text-secondary)' }}>
                        {opt.desc}
                      </div>
                    </div>
                    <div style={{
                      marginLeft: 'auto',
                      width: 22, height: 22, borderRadius: '50%',
                      border: `2px solid ${form.role === opt.value ? 'var(--primary-500)' : 'var(--gray-400)'}`,
                      background: form.role === opt.value ? 'var(--primary-500)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {form.role === opt.value && <Check size={14} color="white" />}
                    </div>
                  </label>
                ))}

                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  onClick={nextStep}
                  style={{ marginTop: '8px' }}
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* STEP 1 — Personal Info */}
            {step === 1 && (
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--gray-500)',
                    }} />
                    <input
                      id="reg-name"
                      className="form-input"
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={handleChange}
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--gray-500)',
                    }} />
                    <input
                      id="reg-phone"
                      className="form-input"
                      type="tel"
                      name="phone"
                      placeholder="675204747"
                      value={form.phone}
                      onChange={handleChange}
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-email">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--gray-500)',
                    }} />
                    <input
                      id="reg-email"
                      className="form-input"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                  <span className="form-hint">Optional, but recommended for account recovery</span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    Back
                  </button>
                  <button type="button" className="btn btn-primary btn-block" onClick={nextStep}>
                    Continue <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2 — Password */}
            {step === 2 && (
              <div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--gray-500)',
                    }} />
                    <input
                      id="reg-password"
                      className="form-input"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      style={{ paddingLeft: '42px', paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '12px', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--gray-500)', padding: '4px',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm-password">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--gray-500)',
                    }} />
                    <input
                      id="reg-confirm-password"
                      className="form-input"
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      style={{ paddingLeft: '42px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                        Creating…
                      </>
                    ) : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="auth-form-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
