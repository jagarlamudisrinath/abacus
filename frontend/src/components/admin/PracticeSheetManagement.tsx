import React from 'react';
import './PracticeSheetManagement.css';

export default function PracticeSheetManagement() {
  return (
    <div className="practice-sheet-management">
      <div className="management-header">
        <h2>Practice Sheets</h2>
      </div>

      <div className="coming-soon">
        <div className="coming-soon-icon">📋</div>
        <h3>Practice Sheet Management</h3>
        <p>
          This feature is coming soon. You will be able to:
        </p>
        <ul>
          <li>Create and edit practice sheets</li>
          <li>Configure question types and difficulty levels</li>
          <li>Assign sheets to specific teachers or students</li>
          <li>View usage statistics for each sheet</li>
        </ul>
      </div>
    </div>
  );
}
