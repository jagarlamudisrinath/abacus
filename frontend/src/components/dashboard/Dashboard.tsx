import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchDashboard, DashboardData } from '../../services/progress.api';
import StatsOverview from './StatsOverview';
import ScoreChart from './ScoreChart';
import SessionHistory from './SessionHistory';
import WeakAreasCard from './WeakAreasCard';
import IntervalAnalysis from './IntervalAnalysis';
import './Dashboard.css';

interface DashboardProps {
  onStartPractice: () => void;
  onBack: () => void;
}

export default function Dashboard({ onStartPractice, onBack }: DashboardProps) {
  const { student, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await fetchDashboard();
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load dashboard. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading your progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <div className="error-card">
          <h2>Oops!</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={loadDashboard}>
              Try Again
            </button>
            <button className="btn btn-secondary" onClick={onBack}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
          <div className="header-title">
            <h1>Your Progress</h1>
            <p>Welcome back, {student?.name}!</p>
          </div>
        </div>
        <div className="header-right">
          <div className="streak-badge">
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{data.streakDays}</span>
            <span className="streak-label">day streak</span>
          </div>
          <button className="btn btn-primary" onClick={onStartPractice}>
            Start Practice
          </button>
          <button className="btn btn-text logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <StatsOverview stats={data.stats} />

        <div className="dashboard-grid">
          <div className="chart-section">
            <h2>Score Trend</h2>
            <ScoreChart data={data.scoreTrend} />
          </div>

          <div className="sessions-section">
            <h2>Recent Sessions</h2>
            <SessionHistory sessions={data.stats.recentSessions} />
          </div>
        </div>

        <div className="dashboard-grid secondary">
          {data.weakAreas.length > 0 && (
            <div className="weak-areas-section">
              <h2>Areas to Improve</h2>
              <WeakAreasCard areas={data.weakAreas} />
            </div>
          )}

          {data.intervalTrends.length > 0 && (
            <div className="interval-section">
              <h2>Performance by Interval</h2>
              <IntervalAnalysis data={data.intervalTrends} />
            </div>
          )}
        </div>

        <div className="dashboard-footer">
          <p>Last practice: {formatDate(data.lastPracticeDate)}</p>
        </div>
      </main>
    </div>
  );
}
