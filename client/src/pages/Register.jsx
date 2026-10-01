import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Alert from '../components/Alert';
import { User, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please provide a valid email address.');
      return false;
    }
    if (!password || password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
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
      await register(name.trim(), email.trim(), password);
      // Flowchart: Login/signup -> home -> then whatever the user wants to do
      navigate('/', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please verify your details.');
      setErrorDetails(err.details || null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillSample = () => {
    setName('Amélie Laurent');
    setEmail('amelie.laurent7622@gmail.com');
    setPassword('CareerGoal2026!');
  };

  return (
    <AuthLayout
      title={'Join the platform\nCreate account!'}
      footerPrompt="Already have an account?"
      footerLinkText="Login"
      footerLinkTo="/login"
    >
      {formError && (
        <div style={{ marginBottom: '1.25rem' }}>
          <Alert type="danger" message={formError} details={errorDetails} />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
            }}
          >
            <User size={18} color="#2563eb" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
            <input
              id="register-name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoComplete="name"
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

        {/* Email Address */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
            }}
          >
            <Mail size={18} color="#2563eb" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
            <input
              id="register-email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="email"
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

        {/* Password */}
        <div style={{ marginBottom: '1.15rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: '2px solid #2563eb',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
            }}
          >
            <Lock size={18} color="#2563eb" style={{ flexShrink: 0, marginRight: '0.75rem' }} />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
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

        {/* Remember me option */}
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
            onClick={handleFillSample}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '0.8rem',
              color: '#1d4ed8',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Prefill Example
          </button>
        </div>

        {/* Solid Electric Blue Sign Up Button */}
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
            transition: 'background-color 0.15s ease',
            opacity: submitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#1e40af')}
          onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#1d4ed8')}
        >
          <span>{submitting ? 'Creating account...' : 'Sign Up'}</span>
        </button>
      </form>
    </AuthLayout>
  );
}
