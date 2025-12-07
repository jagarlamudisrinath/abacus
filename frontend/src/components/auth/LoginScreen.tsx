import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginScreen.css';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(identifier, name || undefined);

      if (result.isNewUser && !name) {
        // If it's a new user and no name was provided, show the name input
        setShowNameInput(true);
        setIsLoading(false);
        return;
      }

      onLoginSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      if (message.includes('Name is required')) {
        setShowNameInput(true);
      } else {
        setError(message);
      }
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

          {showNameInput && (
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
              <p className="form-hint">First time? Enter your name to create an account.</p>
            </div>
          )}

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : showNameInput ? 'Create Account' : 'Continue'}
          </button>
        </form>

        <p className="login-note">
          Sign in to save your progress and track your performance.
        </p>
      </div>
    </div>
  );
}
