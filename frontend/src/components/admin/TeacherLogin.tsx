import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './TeacherLogin.css';

interface TeacherLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

type Mode = 'login' | 'register';

export default function TeacherLogin({ onLoginSuccess, onBack }: TeacherLoginProps) {
  const { teacherLogin, teacherRegister } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await teacherLogin(email, password);
      } else {
        await teacherRegister(email, password, name);
      }
      onLoginSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="teacher-login-screen">
      <div className="teacher-login-card">
        <button className="back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Student Login
        </button>

        <div className="teacher-login-header">
          <div className="teacher-login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="48" height="48">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1>Teacher Portal</h1>
          <p>Manage practice sheets and students</p>
        </div>

        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            className={`mode-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="teacher-login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus={mode === 'register'}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoFocus={mode === 'login'}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Create a password (min 6 characters)' : 'Enter your password'}
              required
              minLength={6}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
            {isLoading
              ? mode === 'login' ? 'Signing in...' : 'Creating account...'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="teacher-login-note">
          {mode === 'login'
            ? "Don't have an account? Click Register above."
            : 'Already have an account? Click Sign In above.'}
        </p>
      </div>
    </div>
  );
}
