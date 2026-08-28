import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import companyLogo from '../assets/companyLogo';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !password) {
      setError('Please enter both User ID and Password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(userId, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 30%, rgba(79, 70, 229, 0.15) 0%, rgba(9, 13, 22, 1) 70%)', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', border: '1px solid rgba(99, 102, 241, 0.35)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}>
        
        {/* Brand Header with Company Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{ 
              width: '72px', 
              height: '72px', 
              borderRadius: '18px', 
              background: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.25rem auto', 
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2)',
              overflow: 'hidden',
              padding: '6px'
            }}
          >
            <img 
              src={companyLogo} 
              alt="Sri Durga Enterprises Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.025em', color: 'white', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            SRI DURGA ENTERPRISES
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enterprise Inventory, Tax Invoicing & Compliance Portal
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label">User ID *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Enter your User ID"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Sri Durga Enterprises'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};
