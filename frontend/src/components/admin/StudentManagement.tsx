import React, { useState, useEffect } from 'react';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  setStudentPassword,
  StudentSummary,
} from '../../services/admin.api';
import StudentActivityModal from './StudentActivityModal';
import './StudentManagement.css';

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingActivityStudent, setViewingActivityStudent] = useState<StudentSummary | null>(null);
  const [passwordStudent, setPasswordStudent] = useState<StudentSummary | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(true);

  // Form state for adding new students
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Form state for editing
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchStudents();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await createStudent({
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        grade: newGrade.trim() || undefined,
        email: newEmail.trim() || undefined,
      });
      setNewFirstName('');
      setNewLastName('');
      setNewGrade('');
      setNewEmail('');
      setShowAddForm(false);
      loadStudents();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add student';
      setError(message);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setError(null);
      await updateStudent(id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        grade: editGrade.trim(),
        email: editEmail.trim(),
      });
      setEditingId(null);
      loadStudents();
    } catch (err) {
      setError('Failed to update student');
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteStudent(id);
      setDeleteConfirm(null);
      loadStudents();
    } catch (err) {
      setError('Failed to delete student');
      console.error(err);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordStudent) return;

    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      await setStudentPassword(passwordStudent.id, newPassword, forcePasswordChange);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      // Close modal after short delay to show success
      setTimeout(() => {
        setPasswordStudent(null);
        setPasswordSuccess(false);
        loadStudents();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set password';
      setPasswordError(message);
    }
  };

  const openPasswordModal = (student: StudentSummary) => {
    setPasswordStudent(student);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
    setForcePasswordChange(true);
  };

  const startEdit = (student: StudentSummary) => {
    setEditingId(student.id);
    setEditFirstName(student.firstName || '');
    setEditLastName(student.lastName || '');
    setEditGrade(student.grade || '');
    setEditEmail(student.email || '');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="student-management">
      <div className="student-management-header">
        <h2>Students</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : '+ Add Student'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {showAddForm && (
        <form className="add-student-form" onSubmit={handleAdd}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                placeholder="First Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                placeholder="Last Name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="grade">Grade</label>
              <input
                id="grade"
                type="text"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                placeholder="e.g., 5th, 6A"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="student@example.com"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="loading">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <p>No students yet. Add your first student to get started.</p>
        </div>
      ) : (
        <div className="students-table">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Grade</th>
                <th>Email</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="identifier">{student.studentId || '-'}</td>
                  <td>
                    {editingId === student.id ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="edit-input"
                          placeholder="First"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="edit-input"
                          placeholder="Last"
                        />
                      </div>
                    ) : (
                      student.name
                    )}
                  </td>
                  <td>
                    {editingId === student.id ? (
                      <input
                        type="text"
                        value={editGrade}
                        onChange={(e) => setEditGrade(e.target.value)}
                        className="edit-input"
                        placeholder="Grade"
                        style={{ maxWidth: '80px' }}
                      />
                    ) : (
                      student.grade || '-'
                    )}
                  </td>
                  <td>
                    {editingId === student.id ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="edit-input"
                        placeholder="Email"
                        style={{ maxWidth: '180px' }}
                      />
                    ) : (
                      student.email || '-'
                    )}
                  </td>
                  <td className="date">{formatDate(student.lastLoginAt)}</td>
                  <td className="actions">
                    {editingId === student.id ? (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleUpdate(student.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : deleteConfirm === student.id ? (
                      <>
                        <span className="delete-confirm-text">Delete?</span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(student.id)}
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
                          onClick={() => setViewingActivityStudent(student)}
                        >
                          Activity
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => openPasswordModal(student)}
                          title={student.hasPassword ? 'Reset Password' : 'Set Password'}
                        >
                          {student.hasPassword ? 'Reset Pwd' : 'Set Pwd'}
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => startEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteConfirm(student.id)}
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

      {viewingActivityStudent && (
        <StudentActivityModal
          student={viewingActivityStudent}
          onClose={() => setViewingActivityStudent(null)}
        />
      )}

      {passwordStudent && (
        <div className="modal-overlay" onClick={() => setPasswordStudent(null)}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{passwordStudent.hasPassword ? 'Reset' : 'Set'} Password for {passwordStudent.name}</h3>
              <button className="close-btn" onClick={() => setPasswordStudent(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSetPassword} className="password-form">
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={forcePasswordChange}
                    onChange={(e) => setForcePasswordChange(e.target.checked)}
                  />
                  <span>Require password change on next login</span>
                </label>
              </div>
              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">Password set successfully!</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordStudent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={passwordSuccess}>
                  {passwordStudent.hasPassword ? 'Reset' : 'Set'} Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
