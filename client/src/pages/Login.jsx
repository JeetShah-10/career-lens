import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Alert from '../components/Alert';
import { User, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    if (!email.trim()) {
      setFormError('Please enter your username or email address.');
      return false;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setFormError(null);
    setErrorDetails(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      // In this system, user identifier can be email or demo username
      const normalizedEmail = email.includes('@') ? email.trim() : `${email.trim().toLowerCase()}@example.com`;
      await login(normalizedEmail, password);
      // Strictly enforce requested flowchart: Login/signup -> home -> then whatever the user wants to do
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Invalid email or password');
      setErrorDetails(err.details || null);
    } finally {
      setSubmitting(false);
    }
  };

  // Instant demo login for hackathon testing & judges
  const handleQuickDemo = async () => {
    const demoEmail = 'alex.rivera@example.com';
    const demoPass = 'Password123!';
    setEmail('alex.rivera@example.com');
    setPassword(demoPass);
    setSubmitting(true);
    setFormError(null);

    try {
      await login(demoEmail, demoPass);
      // Strictly enforce requested flowchart: Login/signup -> home
      navigate('/', { replace: true });
    } catch {
      // Auto-register demo account if first time running
      try {
        await register('Alex Rivera', demoEmail, demoPass);
        navigate('/', { replace: true });
      } catch (regErr) {
        setFormError(regErr.message || 'Could not auto-login with demo account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={'Welcome\nto the website!'}
      footerPrompt="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo="/register"
    >
      {formError && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type="danger" message={formError} details={errorDetails} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Username / Email Input Box - Exact Reference Image Styling */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <User size={18} color="#2563eb" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
            <input
              id="login-username"
              type="text"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="username"
              required
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.95rem',
                color: '#1d4ed8',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Password Input Box - Exact Reference Image Styling */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <Lock size={18} color="#2563eb" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="current-password"
              required
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.95rem',
                color: '#1d4ed8',
                fontWeight: 500,
                fontFamily: 'inherit',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#2563eb',
                opacity: 0.8,
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: '#1d4ed8',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                accentColor: '#1d4ed8',
                cursor: 'pointer',
                width: '14px',
                height: '14px',
              }}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={handleQuickDemo}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '0.8rem',
              color: '#1d4ed8',
              cursor: 'pointer',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Forgot password?
          </button>
        </div>

        {/* Solid Electric Blue Login Button */}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            backgroundColor: '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.9rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
            transition: 'background-color 0.15s ease, transform 0.15s ease',
            opacity: submitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#1e40af')}
          onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
        >
          <span>{submitting ? 'Logging in...' : 'Login'}</span>
        </button>

        {/* Quick Demo Pill Shortcut */}
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={submitting}
            style={{
              background: 'rgba(37, 99, 235, 0.08)',
              border: '1px dashed #2563eb',
              borderRadius: '9999px',
              padding: '0.45rem 1rem',
              fontSize: '0.78rem',
              color: '#1d4ed8',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={13} color="#1d4ed8" />
            <span>Instant Demo Account (Alex Rivera)</span>
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
