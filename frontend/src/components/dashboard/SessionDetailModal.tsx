import React, { useEffect, useState } from 'react';
import { SessionDetail, fetchSessionDetail, deleteSession } from '../../services/progress.api';
import './SessionDetailModal.css';

interface SessionDetailModalProps {
  sessionId: string;
  onClose: () => void;
  onDelete?: () => void;
}

export default function SessionDetailModal({ sessionId, onClose, onDelete }: SessionDetailModalProps) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const formatIntervalTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (startSeconds: number, endSeconds: number): string => {
    const duration = endSeconds - startSeconds;
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
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
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, showDeleteConfirm]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteSession(sessionId);
      onClose();
      onDelete?.();
    } catch (err) {
      setError('Failed to delete session');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="session-detail-modal">
        <div className="modal-header">
          <h2>Session Details</h2>
          <div className="modal-header-actions">
            <button
              className="delete-btn"
              onClick={handleDeleteClick}
              disabled={isLoading || isDeleting}
              title="Delete this session"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <h3>Delete Session?</h3>
              <p>Are you sure you want to delete this session? This action cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button
                  className="cancel-btn"
                  onClick={handleCancelDelete}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="confirm-delete-btn"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

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
                <div className="stat-item">
                  <span className="stat-value">
                    {session.attempted > 0
                      ? (session.timeTaken / session.attempted).toFixed(1)
                      : '0'}s
                  </span>
                  <span className="stat-label">Avg/Question</span>
                </div>
              </div>
            </div>

            {/* Interval Performance */}
            {session.intervals && session.intervals.length > 0 && (
              <div className="section">
                <h4>Interval Breakdown ({session.intervals.length} intervals)</h4>
                <div className="intervals-cards">
                  {session.intervals.map((interval) => {
                    const accuracy = interval.questionsAttempted > 0
                      ? Math.round((interval.correct / interval.questionsAttempted) * 100)
                      : 0;
                    return (
                      <div key={interval.intervalNumber} className="interval-card">
                        <div className="interval-header">
                          <span className="interval-title">Session #{interval.intervalNumber}</span>
                          <span className="interval-duration">
                            {formatDuration(interval.startTime, interval.endTime)}
                          </span>
                        </div>
                        <div className="interval-time-range">
                          <span className="time-label">Start:</span>
                          <span className="time-value">{formatIntervalTime(interval.startTime)}</span>
                          <span className="time-separator">-</span>
                          <span className="time-label">End:</span>
                          <span className="time-value">{formatIntervalTime(interval.endTime)}</span>
                        </div>
                        <div className="interval-stats">
                          <div className="interval-stat">
                            <span className="stat-number">{interval.questionsAttempted}</span>
                            <span className="stat-desc">Questions</span>
                          </div>
                          <div className="interval-stat">
                            <span className="stat-number correct">{interval.correct}</span>
                            <span className="stat-desc">Correct</span>
                          </div>
                          <div className="interval-stat">
                            <span className="stat-number incorrect">{interval.incorrect}</span>
                            <span className="stat-desc">Wrong</span>
                          </div>
                          <div className="interval-stat">
                            <span className={`stat-number ${accuracy >= 80 ? 'excellent' : accuracy >= 60 ? 'good' : accuracy >= 40 ? 'average' : 'poor'}`}>
                              {accuracy}%
                            </span>
                            <span className="stat-desc">Accuracy</span>
                          </div>
                          <div className="interval-stat">
                            <span className="stat-number">{interval.avgTimePerQuestion.toFixed(1)}s</span>
                            <span className="stat-desc">Avg/Q</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
