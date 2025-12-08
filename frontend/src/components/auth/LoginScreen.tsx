import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginScreen.css';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onShowAdmin?: () => void;
}

export default function LoginScreen({ onLoginSuccess, onShowAdmin }: LoginScreenProps) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(identifier);
      onLoginSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmail = identifier.includes('@');
  const placeholderText = 'Enter email or student ID';

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">ALAMA</div>
          <h1>Welcome Back!</h1>
          <p>Sign in to track your progress</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">
              {isEmail ? 'Email' : 'Email or Student ID'}
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={placeholderText}
              required
              autoFocus
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="login-note">
          Don't have an account? Contact your teacher to create one.
        </p>

        {onShowAdmin && (
          <button
            type="button"
            className="admin-link"
            onClick={onShowAdmin}
          >
            Admin Panel
          </button>
        )}
      </div>
    </div>
  );
}
