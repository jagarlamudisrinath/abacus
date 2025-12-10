import React, { useState, useEffect } from 'react';
import {
  fetchTeachers,
  createTeacher,
  deleteTeacher,
  setTeacherPassword,
  TeacherSummary,
} from '../../services/superuser.api';
import './TeacherManagement.css';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [passwordTeacher, setPasswordTeacher] = useState<TeacherSummary | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [forcePasswordChangeOnReset, setForcePasswordChangeOnReset] = useState(true);

  // Add Teacher modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTeacherName, setAddTeacherName] = useState('');
  const [addTeacherEmail, setAddTeacherEmail] = useState('');
  const [addTeacherPassword, setAddTeacherPassword] = useState('');
  const [addTeacherConfirmPassword, setAddTeacherConfirmPassword] = useState('');
  const [addTeacherError, setAddTeacherError] = useState<string | null>(null);
  const [addTeacherLoading, setAddTeacherLoading] = useState(false);
  const [forcePasswordChangeOnCreate, setForcePasswordChangeOnCreate] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTeachers();
      setTeachers(data);
    } catch (err) {
      setError('Failed to load teachers');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      await deleteTeacher(id);
      setDeleteConfirm(null);
      loadTeachers();
    } catch (err) {
      setError('Failed to delete teacher');
      console.error(err);
    }
  };

  const openPasswordModal = (teacher: TeacherSummary) => {
    setPasswordTeacher(teacher);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
    setForcePasswordChangeOnReset(true);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordTeacher) return;

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
      await setTeacherPassword(passwordTeacher.id, newPassword, forcePasswordChangeOnReset);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordTeacher(null);
        setPasswordSuccess(false);
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set password';
      setPasswordError(message);
    }
  };

  const openAddModal = () => {
    setShowAddModal(true);
    setAddTeacherName('');
    setAddTeacherEmail('');
    setAddTeacherPassword('');
    setAddTeacherConfirmPassword('');
    setAddTeacherError(null);
    setForcePasswordChangeOnCreate(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddTeacherError(null);
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTeacherError(null);

    if (!addTeacherName.trim()) {
      setAddTeacherError('Name is required');
      return;
    }

    if (!addTeacherEmail.trim()) {
      setAddTeacherError('Email is required');
      return;
    }

    if (addTeacherPassword.length < 6) {
      setAddTeacherError('Password must be at least 6 characters');
      return;
    }

    if (addTeacherPassword !== addTeacherConfirmPassword) {
      setAddTeacherError('Passwords do not match');
      return;
    }

    setAddTeacherLoading(true);
    try {
      await createTeacher(addTeacherEmail.trim(), addTeacherName.trim(), addTeacherPassword, forcePasswordChangeOnCreate);
      closeAddModal();
      loadTeachers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create teacher';
      setAddTeacherError(message);
    } finally {
      setAddTeacherLoading(false);
    }
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
    <div className="teacher-management">
      <div className="teacher-management-header">
        <h2>Teachers</h2>
        <button className="btn btn-primary" onClick={openAddModal}>
          Add Teacher
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading teachers...</div>
      ) : teachers.length === 0 ? (
        <div className="empty-state">
          <p>No teachers registered yet.</p>
        </div>
      ) : (
        <div className="teachers-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Students</th>
                <th>Registered</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>{teacher.name}</td>
                  <td className="email">{teacher.email || '-'}</td>
                  <td className="student-count">{teacher.studentCount}</td>
                  <td className="date">{formatDate(teacher.createdAt)}</td>
                  <td className="date">{formatDate(teacher.lastLoginAt)}</td>
                  <td className="actions">
                    {deleteConfirm === teacher.id ? (
                      <>
                        <span className="delete-confirm-text">Delete?</span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(teacher.id)}
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
                          onClick={() => openPasswordModal(teacher)}
                        >
                          Reset Pwd
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => setDeleteConfirm(teacher.id)}
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

      {/* Password Reset Modal */}
      {passwordTeacher && (
        <div className="modal-overlay" onClick={() => setPasswordTeacher(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Reset Password for {passwordTeacher.name}</h3>
              <button className="close-btn" onClick={() => setPasswordTeacher(null)}>
                &times;
              </button>
            </div>
            <form className="password-form" onSubmit={handleSetPassword}>
              {passwordSuccess && (
                <div className="success-message">Password updated successfully!</div>
              )}
              {passwordError && <div className="password-error">{passwordError}</div>}
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={forcePasswordChangeOnReset}
                    onChange={(e) => setForcePasswordChangeOnReset(e.target.checked)}
                  />
                  <span>Require password change on next login</span>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPasswordTeacher(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Teacher</h3>
              <button className="close-btn" onClick={closeAddModal}>
                &times;
              </button>
            </div>
            <form className="password-form" onSubmit={handleAddTeacher}>
              {addTeacherError && <div className="password-error">{addTeacherError}</div>}
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={addTeacherName}
                  onChange={(e) => setAddTeacherName(e.target.value)}
                  placeholder="Enter teacher's name"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={addTeacherEmail}
                  onChange={(e) => setAddTeacherEmail(e.target.value)}
                  placeholder="Enter teacher's email"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={addTeacherPassword}
                  onChange={(e) => setAddTeacherPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={addTeacherConfirmPassword}
                  onChange={(e) => setAddTeacherConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={forcePasswordChangeOnCreate}
                    onChange={(e) => setForcePasswordChangeOnCreate(e.target.checked)}
                  />
                  <span>Require password change on first login</span>
                </label>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAddModal}
                  disabled={addTeacherLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={addTeacherLoading}>
                  {addTeacherLoading ? 'Creating...' : 'Create Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
