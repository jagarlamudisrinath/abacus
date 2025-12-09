import React, { useState, useEffect } from 'react';
import {
  fetchAllPracticeSheets,
  fetchPracticeSheet,
  deletePracticeSheet,
  PracticeSheetWithCreator,
  PracticeSheetDetail,
} from '../../services/superuser.api';
import SuperuserPracticeSheetEditor from './SuperuserPracticeSheetEditor';
import './SuperuserPracticeSheets.css';

export default function SuperuserPracticeSheets() {
  const [sheets, setSheets] = useState<PracticeSheetWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // View modal state
  const [viewSheet, setViewSheet] = useState<PracticeSheetDetail | null>(null);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);

  // Editor state - null means show list, string means editing that sheet, 'new' means creating
  const [editorSheetId, setEditorSheetId] = useState<string | null>(null);

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAllPracticeSheets();
      setSheets(data);
    } catch (err) {
      setError('Failed to load practice sheets');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (id: string) => {
    try {
      setIsLoadingSheet(true);
      setError(null);
      const sheet = await fetchPracticeSheet(id);
      setViewSheet(sheet);
    } catch (err) {
      setError('Failed to load practice sheet details');
      console.error(err);
    } finally {
      setIsLoadingSheet(false);
    }
  };

  const handleEdit = (sheetId: string) => {
    setEditorSheetId(sheetId);
  };

  const handleCreate = () => {
    setEditorSheetId('new');
  };

  const handleEditorClose = () => {
    setEditorSheetId(null);
    loadSheets();
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deletePracticeSheet(id);
      setDeleteConfirm(null);
      loadSheets();
    } catch (err) {
      setError('Failed to delete practice sheet');
      console.error(err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // If editor is open, show the editor instead
  if (editorSheetId !== null) {
    return (
      <SuperuserPracticeSheetEditor
        sheetId={editorSheetId === 'new' ? null : editorSheetId}
        onClose={handleEditorClose}
      />
    );
  }

  return (
    <div className="superuser-practice-sheets">
      <div className="practice-sheets-header">
        <h2>Practice Sheets</h2>
        <div className="header-actions">
          <span className="sheet-count">{sheets.length} sheets</span>
          <button className="btn btn-primary" onClick={handleCreate}>
            Add Sheet
          </button>
        </div>
      </div>

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
          <p>No practice sheets have been created yet.</p>
          <button className="btn btn-primary" onClick={handleCreate}>
            Create First Sheet
          </button>
        </div>
      ) : (
        <div className="sheets-table">
          <table>
            <thead>
              <tr>
                <th>Sheet Name</th>
                <th>Created By</th>
                <th>Questions</th>
                <th>Created</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sheets.map((sheet) => (
                <tr key={sheet.id}>
                  <td className="sheet-name">{sheet.name}</td>
                  <td className="created-by">
                    {sheet.createdBy ? (
                      <>
                        <span className="teacher-name">{sheet.createdBy.name}</span>
                        {sheet.createdBy.email && (
                          <span className="teacher-email">{sheet.createdBy.email}</span>
                        )}
                      </>
                    ) : (
                      <span className="no-creator">System</span>
                    )}
                  </td>
                  <td className="question-count">{sheet.questionCount}</td>
                  <td className="date">{formatDate(sheet.createdAt)}</td>
                  <td className="date">{formatDate(sheet.updatedAt)}</td>
                  <td className="actions">
                    {deleteConfirm === sheet.id ? (
                      <>
                        <span className="delete-confirm-text">Delete?</span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(sheet.id)}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleView(sheet.id)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(sheet.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteConfirm(sheet.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Sheet Modal */}
      {(viewSheet || isLoadingSheet) && (
        <div className="modal-overlay" onClick={() => !isLoadingSheet && setViewSheet(null)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isLoadingSheet ? 'Loading...' : viewSheet?.name}</h3>
              <button
                className="close-btn"
                onClick={() => setViewSheet(null)}
                disabled={isLoadingSheet}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {isLoadingSheet ? (
                <div className="loading">Loading questions...</div>
              ) : viewSheet ? (
                <>
                  <div className="sheet-meta">
                    <span>Created: {formatDate(viewSheet.createdAt)}</span>
                    <span>Updated: {formatDate(viewSheet.updatedAt)}</span>
                    <span>Questions: {viewSheet.questions.length}</span>
                  </div>
                  <div className="questions-list">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Expression</th>
                          <th>Answer</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewSheet.questions.map((q) => (
                          <tr key={q.questionNumber}>
                            <td className="q-number">{q.questionNumber}</td>
                            <td className="q-expression">{q.expression}</td>
                            <td className="q-answer">{q.answer}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : null}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setViewSheet(null)}
                disabled={isLoadingSheet}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
