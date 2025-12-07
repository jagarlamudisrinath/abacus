import React, { useEffect, useState } from 'react';
import { SessionDetail, fetchSessionDetail } from '../../services/progress.api';
import './SessionDetailModal.css';

interface SessionDetailModalProps {
  sessionId: string;
  onClose: () => void;
}

export default function SessionDetailModal({ sessionId, onClose }: SessionDetailModalProps) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        setIsLoading(true);
        const data = await fetchSessionDetail(sessionId);
        setSession(data);
      } catch (err) {
        setError('Failed to load session details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  // Handle click outside modal
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="session-detail-modal">
        <div className="modal-header">
          <h2>Session Details</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {isLoading && (
          <div className="modal-loading">
            <span>Loading session details...</span>
          </div>
        )}

        {error && (
          <div className="modal-error">
            <span>{error}</span>
          </div>
        )}

        {session && !isLoading && (
          <div className="modal-body">
            {/* Session Header */}
            <div className="session-header-card">
              <div className="session-title">
                <h3>{session.practiceSheetName}</h3>
                <span className={`mode-badge ${session.mode}`}>{session.mode}</span>
              </div>
              <div className="session-datetime">
                {formatDate(session.completedAt)}
              </div>
            </div>

            {/* Score Summary */}
            <div className="score-summary">
              <div className={`score-circle ${getScoreColor(session.score)}`}>
                <span className="score-value">{Math.round(session.score)}%</span>
                <span className="score-label">Score</span>
              </div>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value correct">{session.correct}</span>
                  <span className="stat-label">Correct</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value incorrect">{session.incorrect}</span>
                  <span className="stat-label">Incorrect</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{session.total - session.attempted}</span>
                  <span className="stat-label">Unanswered</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{formatTime(session.timeTaken)}</span>
                  <span className="stat-label">Time</span>
                </div>
              </div>
            </div>

            {/* Interval Performance */}
            {session.intervals && session.intervals.length > 0 && (
              <div className="section">
                <h4>Interval Performance</h4>
                <div className="intervals-table">
                  <div className="table-header">
                    <span>Interval</span>
                    <span>Questions</span>
                    <span>Correct</span>
                    <span>Accuracy</span>
                    <span>Avg Time</span>
                  </div>
                  {session.intervals.map((interval) => (
                    <div key={interval.intervalNumber} className="table-row">
                      <span>#{interval.intervalNumber}</span>
                      <span>{interval.questionsAttempted}</span>
                      <span className="correct">{interval.correct}</span>
                      <span>
                        {interval.questionsAttempted > 0
                          ? Math.round((interval.correct / interval.questionsAttempted) * 100)
                          : 0}%
                      </span>
                      <span>{interval.avgTimePerQuestion.toFixed(1)}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Responses */}
            {session.responses && session.responses.length > 0 && (
              <div className="section">
                <h4>Question Details</h4>
                <div className="responses-list">
                  {session.responses.map((response) => (
                    <div
                      key={response.questionNumber}
                      className={`response-item ${
                        response.isCorrect === null
                          ? 'unanswered'
                          : response.isCorrect
                          ? 'correct'
                          : 'incorrect'
                      }`}
                    >
                      <span className="q-number">Q{response.questionNumber}</span>
                      <span className="q-expression">{response.expression}</span>
                      <span className="q-answer">
                        {response.userAnswer !== null ? (
                          <>
                            <span className="user-answer">{response.userAnswer}</span>
                            {!response.isCorrect && (
                              <span className="correct-answer">({response.correctAnswer})</span>
                            )}
                          </>
                        ) : (
                          <span className="no-answer">-</span>
                        )}
                      </span>
                      <span className="q-time">
                        {response.timeSpent !== null ? `${response.timeSpent}s` : '-'}
                      </span>
                      <span className="q-status">
                        {response.isCorrect === null ? '?' : response.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
