import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <span className="wifi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12.55a11 11 0 0 1 14.08 0" />
            <path d="M1.42 9a16 16 0 0 1 21.16 0" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </span>
      </div>

      <div className="footer-content">
        <span className="help-text">
          Need Help? Contact us (Please add country code while dialing)
        </span>
        <div className="contact-numbers">
          <div className="contact-item">
            <span className="flag">🇺🇸</span>
            <span>+1 (800) 265-6038</span>
          </div>
          <div className="contact-item">
            <span className="flag">🇮🇳</span>
            <span>+91 80471-89190</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
