import React, { useState, useEffect } from 'react';
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
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
    </div>
  );
}
