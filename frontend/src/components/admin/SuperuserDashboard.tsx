import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TeacherManagement from './TeacherManagement';
import SuperuserStudentManagement from './SuperuserStudentManagement';
import SuperuserPracticeSheets from './SuperuserPracticeSheets';
import './SuperuserDashboard.css';

type Tab = 'teachers' | 'students' | 'sheets';

interface SuperuserDashboardProps {
  onLogout: () => void;
}

export default function SuperuserDashboard({ onLogout }: SuperuserDashboardProps) {
  const { student } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('teachers');

  return (
    <div className="superuser-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Alama Abacus</h1>
          <span className="superuser-badge">Super Admin</span>
        </div>
        <div className="header-right">
          <span className="user-name">{student?.name}</span>
          <button className="btn btn-secondary" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => setActiveTab('teachers')}
        >
          Teachers
        </button>
        <button
          className={`nav-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          All Students
        </button>
        <button
          className={`nav-tab ${activeTab === 'sheets' ? 'active' : ''}`}
          onClick={() => setActiveTab('sheets')}
        >
          Practice Sheets
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'teachers' && <TeacherManagement />}
        {activeTab === 'students' && <SuperuserStudentManagement />}
        {activeTab === 'sheets' && <SuperuserPracticeSheets />}
      </main>
    </div>
  );
}
