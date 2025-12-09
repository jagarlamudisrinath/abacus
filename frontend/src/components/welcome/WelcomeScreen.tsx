import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { TestMode, PracticeSheet } from '../../types';
import { getPracticeSheets } from '../../services/api';
import './WelcomeScreen.css';

interface WelcomeScreenProps {
  onStartTest: (mode: TestMode, practiceSheetId: string) => void;
  onShowDashboard: () => void;
  onLogout: () => void;
  onManageSheets?: () => void;
}

// Fallback practice sheets in case API is not available
const FALLBACK_SHEETS: PracticeSheet[] = [
  { id: 'aa-2', name: 'AA Practice Sheet 2', questionCount: 66 },
  { id: 'aa-3', name: 'AA Practice Sheet 3', questionCount: 74 },
  { id: 'aa-7', name: 'AA Practice Sheet 7', questionCount: 73 },
  { id: 'aa-9', name: 'AA Practice Sheet 9', questionCount: 71 },
  { id: 'aa-10', name: 'AA Practice Sheet 10', questionCount: 91 },
  { id: 'aa2-5', name: 'AA2 Practice Sheet 5', questionCount: 75 },
  { id: 'aa2-6', name: 'AA2 Practice Sheet 6', questionCount: 67 },
  { id: 'aa2-8', name: 'AA2 Practice Sheet 8', questionCount: 74 },
];

export default function WelcomeScreen({ onStartTest, onShowDashboard, onLogout, onManageSheets }: WelcomeScreenProps) {
  const { student, isTeacher } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [selectedMode, setSelectedMode] = useState<TestMode>('practice');
  const [selectedSheet, setSelectedSheet] = useState('aa-2');
  const [practiceSheets, setPracticeSheets] = useState<PracticeSheet[]>(FALLBACK_SHEETS);
  const [isLoading, setIsLoading] = useState(true);

  // Use student name from profile
  const studentName = student?.name || 'Student';

  useEffect(() => {
    async function loadSheets() {
      try {
        const sheets = await getPracticeSheets();
        setPracticeSheets(sheets);
      } catch (error) {
        console.error('Failed to load practice sheets, using fallback:', error);
        // Keep using fallback sheets
      } finally {
        setIsLoading(false);
      }
    }
    loadSheets();
  }, []);

  const handleStart = () => {
    if (!selectedSheet) {
      alert('Please select a practice sheet');
      return;
    }
    onStartTest(selectedMode, selectedSheet);
  };

  const selectedSheetData = practiceSheets.find(s => s.id === selectedSheet);

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="header-top">
            <div className="logo-large">ALAMA</div>
            <div className="header-actions">
              {isTeacher && onManageSheets && (
                <button className="btn btn-secondary header-btn" onClick={onManageSheets}>
                  Manage Sheets
                </button>
              )}
              <button className="btn btn-secondary header-btn" onClick={onShowDashboard}>
                My Progress
              </button>
              <button className="btn btn-outline header-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
          <h1>Welcome, {studentName}!</h1>
          <p className="welcome-subtitle">Mental Math Training Platform</p>
        </div>

        <div className="welcome-form">
          <div className="form-group">
            <label>Select Mode</label>
            <div className="mode-options">
              <button
                className={`mode-option ${selectedMode === 'practice' ? 'active' : ''}`}
                onClick={() => setSelectedMode('practice')}
              >
                <span className="mode-icon">📝</span>
                <span className="mode-title">Practice</span>
                <span className="mode-desc">No time limit, review answers</span>
              </button>
              <button
                className={`mode-option ${selectedMode === 'test' ? 'active' : ''}`}
                onClick={() => setSelectedMode('test')}
              >
                <span className="mode-icon">⏱</span>
                <span className="mode-title">Test</span>
                <span className="mode-desc">Timed, no going back</span>
              </button>
            </div>
          </div>

          {selectedMode === 'practice' && (
            <div className="form-group">
              <label>Check-in Interval</label>
              <div className="interval-input-wrapper">
                <input
                  type="number"
                  className="interval-input"
                  value={settings.intervalMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value >= 1) {
                      updateSettings({ intervalMinutes: value });
                    }
                  }}
                  min={1}
                  max={60}
                />
                <span className="interval-unit">minutes</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Select Practice Sheet</label>
            {isLoading ? (
              <div className="loading-text">Loading practice sheets...</div>
            ) : (
              <div className="practice-sheet-grid">
                {practiceSheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    className={`practice-sheet-option ${selectedSheet === sheet.id ? 'active' : ''}`}
                    onClick={() => setSelectedSheet(sheet.id)}
                  >
                    <span className="sheet-name">{sheet.name}</span>
                    <span className="sheet-count">{sheet.questionCount} questions</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSheetData && (
            <div className="test-overview">
              <h3>Test Overview</h3>
              <div className="overview-stats">
                <div className="stat">
                  <span className="stat-value">{selectedSheetData.questionCount}</span>
                  <span className="stat-label">Questions</span>
                </div>
                <div className="stat">
                  <span className="stat-value">1</span>
                  <span className="stat-label">Section</span>
                </div>
                {selectedMode === 'test' && (
                  <div className="stat">
                    <span className="stat-value">60</span>
                    <span className="stat-label">Minutes</span>
                  </div>
                )}
              </div>
              <div className="sections-list">
                <div className="section-item">
                  <span className="section-icon">➕➖</span>
                  <span>{selectedSheetData.name}</span>
                </div>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary start-btn"
            onClick={handleStart}
            disabled={isLoading || !selectedSheet}
          >
            Start {selectedMode === 'practice' ? 'Practice' : 'Test'}
          </button>
        </div>
      </div>
    </div>
  );
}
