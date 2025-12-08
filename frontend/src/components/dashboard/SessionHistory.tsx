import React, { useState, useMemo } from 'react';
import { SessionSummary } from '../../services/progress.api';
import SessionDetailModal from './SessionDetailModal';
import './SessionHistory.css';

type DateRange = 'all' | '7days' | '30days' | '90days';
type ModeFilter = 'all' | 'practice' | 'test';

interface SessionHistoryProps {
  sessions: SessionSummary[];
  onSessionDeleted?: () => void;
}

export default function SessionHistory({ sessions, onSessionDeleted }: SessionHistoryProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');
  const [minScore, setMinScore] = useState<number>(0);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      // Date filter
      if (dateRange !== 'all') {
        const sessionDate = new Date(session.completedAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
        if (daysDiff > daysMap[dateRange]) return false;
      }

      // Mode filter
      if (modeFilter !== 'all' && session.mode !== modeFilter) return false;

      // Score filter
      if (session.score < minScore) return false;

      return true;
    });
  }, [sessions, dateRange, modeFilter, minScore]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const handleSessionClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleCloseModal = () => {
    setSelectedSessionId(null);
  };

  const clearFilters = () => {
    setDateRange('all');
    setModeFilter('all');
    setMinScore(0);
  };

  const hasActiveFilters = dateRange !== 'all' || modeFilter !== 'all' || minScore > 0;

  return (
    <div className="session-history">
      <div className="session-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="date-filter">Period</label>
            <select
              id="date-filter"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="mode-filter">Mode</label>
            <select
              id="mode-filter"
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as ModeFilter)}
            >
              <option value="all">All</option>
              <option value="practice">Practice</option>
              <option value="test">Test</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="score-filter">Min Score</label>
            <select
              id="score-filter"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
            >
              <option value="0">Any</option>
              <option value="50">50%+</option>
              <option value="60">60%+</option>
              <option value="70">70%+</option>
              <option value="80">80%+</option>
              <option value="90">90%+</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>

        <div className="filter-summary">
          Showing {filteredSessions.length} of {sessions.length} sessions
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="sessions-empty">
          {sessions.length === 0 ? (
            <p>No sessions yet. Start practicing to see your history!</p>
          ) : (
            <p>No sessions match your filters. Try adjusting them.</p>
          )}
        </div>
      ) : (
        <div className="sessions-list">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="session-item clickable"
              onClick={() => handleSessionClick(session.id)}
            >
              <div className="session-main">
                <div className="session-info">
                  <span className="session-name">{session.practiceSheetName}</span>
                  <span className="session-date">{formatDate(session.completedAt)}</span>
                </div>
                <div className={`session-score ${getScoreColor(session.score)}`}>
                  {Math.round(session.score)}%
                </div>
              </div>
              <div className="session-details">
                <span className="detail">
                  <span className="detail-label">Correct:</span>
                  <span className="detail-value correct">{session.correct}/{session.total}</span>
                </span>
                <span className="detail">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{formatTime(session.timeTaken)}</span>
                </span>
                <span className="detail">
                  <span className="detail-label">Mode:</span>
                  <span className="detail-value">{session.mode}</span>
                </span>
              </div>
              <div className="view-details-hint">Click to view details</div>
            </div>
          ))}
        </div>
      )}

      {selectedSessionId && (
        <SessionDetailModal
          sessionId={selectedSessionId}
          onClose={handleCloseModal}
          onDelete={onSessionDeleted}
        />
      )}
    </div>
  );
}
