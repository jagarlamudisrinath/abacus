import React, { useState, useEffect } from 'react';
import {
  fetchPracticeSheets,
  deletePracticeSheet,
  PracticeSheetSummary,
} from '../../services/admin.api';
import { useAuth } from '../../contexts/AuthContext';
import PracticeSheetEditor from './PracticeSheetEditor';
import StudentManagement from './StudentManagement';
import './AdminDashboard.css';

interface AdminDashboardProps {
  onBack: () => void;
}

type ViewMode = 'list' | 'create' | 'edit';
type TabType = 'sheets' | 'students';

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const { student } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('sheets');
  const [sheets, setSheets] = useState<PracticeSheetSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchPracticeSheets();
      setSheets(data);
    } catch (err) {
      setError('Failed to load practice sheets');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePracticeSheet(id);
      setDeleteConfirm(null);
      loadSheets();
    } catch (err) {
      setError('Failed to delete practice sheet');
      console.error(err);
    }
  };

  const handleEdit = (id: string) => {
    setEditingSheetId(id);
    setViewMode('edit');
  };

  const handleCreate = () => {
    setEditingSheetId(null);
    setViewMode('create');
  };

  const handleEditorClose = () => {
    setViewMode('list');
    setEditingSheetId(null);
    loadSheets();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <PracticeSheetEditor
        sheetId={editingSheetId}
        onClose={handleEditorClose}
      />
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Logout
          </button>
          <h1>Teacher Dashboard</h1>
          {student && (
            <span className="teacher-name">Welcome, {student.name}</span>
          )}
        </div>
        {activeTab === 'sheets' && (
          <button className="btn btn-primary" onClick={handleCreate}>
            + Create New Sheet
          </button>
        )}
      </header>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'sheets' ? 'active' : ''}`}
          onClick={() => setActiveTab('sheets')}
        >
          Practice Sheets
        </button>
        <button
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          My Students
        </button>
      </div>

      {activeTab === 'sheets' && (
        <>
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          {isLoading ? (
            <div className="loading">Loading practice sheets...</div>
          ) : sheets.length === 0 ? (
            <div className="empty-state">
              <h2>No Practice Sheets</h2>
              <p>Create your first practice sheet to get started.</p>
              <button className="btn btn-primary" onClick={handleCreate}>
                Create Practice Sheet
              </button>
            </div>
          ) : (
            <div className="sheets-grid">
              {sheets.map((sheet) => (
                <div key={sheet.id} className="sheet-card">
                  <div className="sheet-card-header">
                    <h3>{sheet.name}</h3>
                    <span className="sheet-id">{sheet.id}</span>
                  </div>
                  <div className="sheet-card-body">
                    <div className="sheet-stat">
                      <span className="stat-label">Questions</span>
                      <span className="stat-value">{sheet.questionCount}</span>
                    </div>
                    <div className="sheet-stat">
                      <span className="stat-label">Updated</span>
                      <span className="stat-value">{formatDate(sheet.updatedAt)}</span>
                    </div>
                    {sheet.formUrl && (
                      <a
                        href={sheet.formUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="form-link"
                      >
                        View Form
                      </a>
                    )}
                  </div>
                  <div className="sheet-card-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(sheet.id)}
                    >
                      Edit
                    </button>
                    {deleteConfirm === sheet.id ? (
                      <div className="delete-confirm">
                        <span>Delete?</span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(sheet.id)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-danger"
                        onClick={() => setDeleteConfirm(sheet.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'students' && <StudentManagement />}
    </div>
  );
}
