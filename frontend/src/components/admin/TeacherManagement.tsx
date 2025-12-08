import React, { useState, useEffect } from 'react';
import {
  fetchTeachers,
  deleteTeacher,
  TeacherSummary,
} from '../../services/superuser.api';
import './TeacherManagement.css';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeleteConfirm(teacher.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
