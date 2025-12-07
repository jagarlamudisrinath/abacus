import React from 'react';
import { ProgressStats } from '../../services/progress.api';
import './StatsOverview.css';

interface StatsOverviewProps {
  stats: ProgressStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <div className="stats-overview">
      <div className="stat-card">
        <div className="stat-icon sessions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div className="stat-value">{stats.totalSessions}</div>
        <div className="stat-label">Sessions</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon questions">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div className="stat-value">{stats.totalQuestionsAttempted}</div>
        <div className="stat-label">Questions</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon accuracy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div className="stat-value">{Math.round(stats.overallAccuracy)}%</div>
        <div className="stat-label">Accuracy</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon best">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className="stat-value">{Math.round(stats.bestScore)}%</div>
        <div className="stat-label">Best Score</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon average">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div className="stat-value">{Math.round(stats.averageScore)}%</div>
        <div className="stat-label">Avg Score</div>
      </div>

      <div className="stat-card">
        <div className="stat-icon time">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div className="stat-value">{formatTime(stats.totalTimeSpent)}</div>
        <div className="stat-label">Total Time</div>
      </div>
    </div>
  );
}
