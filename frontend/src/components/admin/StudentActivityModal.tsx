import React, { useState, useEffect } from 'react';
import {
  fetchStudentDashboard,
  fetchStudentSessionDetail,
  StudentSummary,
} from '../../services/admin.api';
import {
  DashboardData,
  SessionSummary,
  SessionDetail,
} from '../../services/progress.api';
import StatsOverview from '../dashboard/StatsOverview';
import ScoreChart from '../dashboard/ScoreChart';
import './StudentActivityModal.css';

interface StudentActivityModalProps {
  student: StudentSummary;
  onClose: () => void;
}

export default function StudentActivityModal({ student, onClose }: StudentActivityModalProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [student.id]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await fetchStudentDashboard(student.id);
      setData(dashboardData);
    } catch (err) {
      setError('Failed to load student activity. Please try again.');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = async (sessionId: string) => {
    try {
      setLoadingSessionId(sessionId);
      const detail = await fetchStudentSessionDetail(student.id, sessionId);
      setSelectedSession(detail);
    } catch (err) {
      console.error('Failed to load session details:', err);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (selectedSession) {
        setSelectedSession(null);
      } else {
        onClose();
      }
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSession) {
          setSelectedSession(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, selectedSession]);

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

  const formatLastPractice = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="modal-overlay student-activity-overlay" onClick={handleOverlayClick}>
      <div className="student-activity-modal">
        <div className="modal-header">
          <div className="header-info">
            <h2>{student.name}'s Activity</h2>
            {student.studentId && <span className="student-id">{student.studentId}</span>}
          </div>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {isLoading && (
          <div className="modal-loading">
            <span>Loading student activity...</span>
          </div>
        )}

        {error && (
          <div className="modal-error">
            <span>{error}</span>
            <button className="btn btn-primary btn-sm" onClick={loadDashboard}>
              Try Again
            </button>
          </div>
        )}

        {data && !isLoading && (
          <div className="modal-body">
            {/* Streak and Stats */}
            <div className="activity-header">
              <div className="streak-badge">
                <span className="streak-icon">🔥</span>
                <span className="streak-count">{data.streakDays}</span>
                <span className="streak-label">day streak</span>
              </div>
              <span className="last-practice">
                Last practice: {formatLastPractice(data.lastPracticeDate)}
              </span>
            </div>

            {/* Stats Overview */}
            <StatsOverview stats={data.stats} />

            {/* Score Chart */}
            {data.scoreTrend.length > 0 && (
              <div className="section">
                <h3>Score Trend</h3>
                <ScoreChart data={data.scoreTrend} />
              </div>
            )}

            {/* Recent Sessions */}
            <div className="section">
              <h3>Recent Sessions</h3>
              {data.stats.recentSessions.length === 0 ? (
                <div className="empty-sessions">
                  <p>No practice sessions yet.</p>
                </div>
              ) : (
                <div className="sessions-list">
                  {data.stats.recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`session-item clickable ${loadingSessionId === session.id ? 'loading' : ''}`}
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
                      {loadingSessionId === session.id ? (
                        <div className="view-details-hint">Loading...</div>
                      ) : (
                        <div className="view-details-hint">Click to view details</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weak Areas */}
            {data.weakAreas.length > 0 && (
              <div className="section">
                <h3>Areas to Improve</h3>
                <div className="weak-areas-list">
                  {data.weakAreas.map((area) => (
                    <div key={area.practiceSheetId} className="weak-area-item">
                      <span className="area-name">{area.practiceSheetName}</span>
                      <div className="area-stats">
                        <span className={`area-score ${getScoreColor(area.averageScore)}`}>
                          {Math.round(area.averageScore)}%
                        </span>
                        <span className={`trend-badge ${area.trend}`}>
                          {area.trend === 'improving' && '↑'}
                          {area.trend === 'declining' && '↓'}
                          {area.trend === 'stable' && '→'}
                          {area.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session Detail Nested Modal */}
        {selectedSession && (
          <div className="session-detail-nested" onClick={(e) => e.stopPropagation()}>
            <div className="nested-modal-header">
              <h3>Session Details</h3>
              <button className="close-btn" onClick={() => setSelectedSession(null)}>&times;</button>
            </div>
            <div className="nested-modal-body">
              {/* Session Header */}
              <div className="session-header-card">
                <div className="session-title">
                  <h4>{selectedSession.practiceSheetName}</h4>
                  <span className={`mode-badge ${selectedSession.mode}`}>{selectedSession.mode}</span>
                </div>
                <div className="session-datetime">
                  {new Date(selectedSession.completedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Score Summary */}
              <div className="score-summary">
                <div className={`score-circle ${getScoreColor(selectedSession.score)}`}>
                  <span className="score-value">{Math.round(selectedSession.score)}%</span>
                  <span className="score-label">Score</span>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-value correct">{selectedSession.correct}</span>
                    <span className="stat-label">Correct</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value incorrect">{selectedSession.incorrect}</span>
                    <span className="stat-label">Incorrect</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{selectedSession.total - selectedSession.attempted}</span>
                    <span className="stat-label">Unanswered</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{formatTime(selectedSession.timeTaken)}</span>
                    <span className="stat-label">Time</span>
                  </div>
                </div>
              </div>

              {/* Interval Performance */}
              {selectedSession.intervals && selectedSession.intervals.length > 0 && (
                <div className="detail-section">
                  <h4>Interval Performance</h4>
                  <div className="intervals-table">
                    <div className="table-header">
                      <span>Interval</span>
                      <span>Questions</span>
                      <span>Correct</span>
                      <span>Accuracy</span>
                      <span>Avg Time</span>
                    </div>
                    {selectedSession.intervals.map((interval) => (
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
              {selectedSession.responses && selectedSession.responses.length > 0 && (
                <div className="detail-section">
                  <h4>Question Details</h4>
                  <div className="responses-list">
                    {selectedSession.responses.map((response) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
