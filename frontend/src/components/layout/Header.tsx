import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useTest } from '../../contexts/TestContext';
import SettingsPanel from '../settings/SettingsPanel';
import './Header.css';

interface HeaderProps {
  onSave?: () => void;
  onSaveAndClose?: () => void;
}

export default function Header({ onSave, onSaveAndClose }: HeaderProps) {
  const { settings } = useSettings();
  const { state } = useTest();
  const [showSettings, setShowSettings] = useState(false);
  const [savedTimeDisplay, setSavedTimeDisplay] = useState('Not saved');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Listen for fullscreen changes (e.g., user presses Escape)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Update saved time display every second
  useEffect(() => {
    const updateSavedTime = () => {
      if (!state.lastSavedAt) {
        setSavedTimeDisplay('Not saved');
        return;
      }

      const seconds = Math.floor((Date.now() - state.lastSavedAt.getTime()) / 1000);

      if (seconds < 60) {
        setSavedTimeDisplay(`${seconds} seconds ago`);
      } else if (seconds < 3600) {
        setSavedTimeDisplay(`${Math.floor(seconds / 60)} minutes ago`);
      } else {
        setSavedTimeDisplay(`${Math.floor(seconds / 3600)} hours ago`);
      }
    };

    updateSavedTime();
    const interval = setInterval(updateSavedTime, 1000);
    return () => clearInterval(interval);
  }, [state.lastSavedAt]);

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <div className="logo-box">
            <div className="logo-emblem">
              <svg className="logo-emblem-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="logo-text-main">ALAMA</span>
            <span className="logo-text-sub">INTERNATIONAL</span>
          </div>
        </div>
        <div className="header-separator" />
        <div className="header-info">
          <div className="candidate-name">{settings.candidateName || 'Guest'}</div>
          <div className="test-info">
            <span className="test-name">{state.test?.name || 'Practice Test'}</span>
            <span className="info-divider">/</span>
            <span className="save-status">
              <svg className="cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
              <span>Saved: {savedTimeDisplay}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <button className="header-btn icon-btn" aria-label="Align">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <button className="header-btn icon-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          )}
        </button>

        <button
          className="header-btn icon-btn"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        <div className="header-actions">
          <button className="btn btn-save" onClick={onSave}>
            Save
          </button>
          <button className="btn btn-save-close" onClick={onSaveAndClose}>
            Save and Close
          </button>
        </div>

        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </div>
    </header>
  );
}
