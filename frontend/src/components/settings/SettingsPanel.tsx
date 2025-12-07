import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import './SettingsPanel.css';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="settings-panel">
      <div className="settings-section">
        <h3 className="settings-title">Adjust Font Size</h3>
        <div className="font-size-options">
          <button
            className={`font-option ${settings.fontSize === 'small' ? 'active' : ''}`}
            onClick={() => updateSettings({ fontSize: 'small' })}
          >
            <span className="font-preview small">Aa</span>
          </button>
          <button
            className={`font-option ${settings.fontSize === 'default' ? 'active' : ''}`}
            onClick={() => updateSettings({ fontSize: 'default' })}
          >
            <span className="font-preview default">Aa</span>
          </button>
          <button
            className={`font-option ${settings.fontSize === 'large' ? 'active' : ''}`}
            onClick={() => updateSettings({ fontSize: 'large' })}
          >
            <span className="font-preview large">Aa</span>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-title">Change Theme</h3>
        <div className="theme-options">
          <button
            className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
            onClick={() => updateSettings({ theme: 'light' })}
            aria-label="Light theme"
          >
            <span className="theme-icon">☀</span>
          </button>
          <button
            className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
            onClick={() => updateSettings({ theme: 'dark' })}
            aria-label="Dark theme"
          >
            <span className="theme-icon">🌙</span>
          </button>
          <button
            className={`theme-option ${settings.theme === 'system' ? 'active' : ''}`}
            onClick={() => updateSettings({ theme: 'system' })}
            aria-label="System theme"
          >
            <span className="theme-icon">⚙</span>
          </button>
        </div>
      </div>
    </div>
  );
}
