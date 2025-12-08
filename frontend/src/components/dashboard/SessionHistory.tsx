import React, { useState } from 'react';
import { SessionSummary } from '../../services/progress.api';
import SessionDetailModal from './SessionDetailModal';
import './SessionHistory.css';

interface SessionHistoryProps {
  sessions: SessionSummary[];
  onSessionDeleted?: () => void;
}

export default function SessionHistory({ sessions, onSessionDeleted }: SessionHistoryProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

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

  if (sessions.length === 0) {
    return (
      <div className="session-history empty">
        <p>No sessions yet. Start practicing to see your history!</p>
      </div>
    );
  }

  return (
    <div className="session-history">
      <div className="sessions-list">
        {sessions.map((session) => (
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
