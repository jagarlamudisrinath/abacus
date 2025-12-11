import React, { useState, useEffect } from 'react';
import {
  fetchAllStudents,
  reassignStudent,
  fetchTeachers,
  setStudentPassword as superuserSetStudentPassword,
  StudentWithTeacher,
  TeacherSummary,
} from '../../services/superuser.api';
import StudentActivityModal from './StudentActivityModal';
import './SuperuserStudentManagement.css';

export default function SuperuserStudentManagement() {
  const [students, setStudents] = useState<StudentWithTeacher[]>([]);
  const [teachers, setTeachers] = useState<TeacherSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingActivityStudent, setViewingActivityStudent] = useState<StudentWithTeacher | null>(null);

  // Password modal state
  const [passwordStudent, setPasswordStudent] = useState<StudentWithTeacher | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(true);

  // Assign teacher modal state
  const [assignStudent, setAssignStudent] = useState<StudentWithTeacher | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [studentsData, teachersData] = await Promise.all([
        fetchAllStudents(),
        fetchTeachers(),
      ]);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setIsLoading(false);
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
      await superuserSetStudentPassword(passwordStudent.id, newPassword, forcePasswordChange);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPasswordStudent(null);
        setPasswordSuccess(false);
        loadData();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to set password';
      setPasswordError(message);
    }
  };

  const openPasswordModal = (student: StudentWithTeacher) => {
    setPasswordStudent(student);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
    setForcePasswordChange(true);
  };

  const openAssignModal = (student: StudentWithTeacher) => {
    setAssignStudent(student);
    setSelectedTeacherId(student.teacherId || '');
  };

  const handleAssignTeacher = async () => {
    if (!assignStudent) return;

    setIsAssigning(true);
    try {
      await reassignStudent(assignStudent.id, selectedTeacherId || null);
      setAssignStudent(null);
      loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign teacher';
      setError(message);
    } finally {
      setIsAssigning(false);
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
    <div className="superuser-student-management">
      <div className="student-management-header">
        <h2>All Students</h2>
        <span className="student-count">{students.length} students</span>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">Loading students...</div>
      ) : students.length === 0 ? (
        <div className="empty-state">
          <p>No students in the system yet.</p>
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
                <th>Teacher</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="identifier">{student.studentId || '-'}</td>
                  <td className="student-name">{student.name}</td>
                  <td>{student.grade || '-'}</td>
                  <td className="email">{student.email || '-'}</td>
                  <td className="teacher-cell">
                    {student.teacherName ? (
                      <span className="teacher-name">{student.teacherName}</span>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </td>
                  <td className="date">{formatDate(student.lastLoginAt)}</td>
                  <td className="actions">
                    {deleteConfirm === student.id ? (
                      <>
                        <span className="delete-confirm-text">Delete?</span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            // Delete not implemented for superuser yet
                            setDeleteConfirm(null);
                          }}
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
                        >
                          Set Pwd
                        </button>
                        <button
                          className="btn btn-sm btn-assign"
                          onClick={() => openAssignModal(student)}
                        >
                          Assign
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
          student={{
            id: viewingActivityStudent.id,
            studentId: viewingActivityStudent.studentId,
            name: viewingActivityStudent.name,
            firstName: viewingActivityStudent.firstName,
            lastName: viewingActivityStudent.lastName,
            grade: viewingActivityStudent.grade,
            email: viewingActivityStudent.email,
            role: 'student',
            teacherId: viewingActivityStudent.teacherId,
            hasPassword: true,
            lastLoginAt: viewingActivityStudent.lastLoginAt,
            createdAt: viewingActivityStudent.createdAt,
          }}
          onClose={() => setViewingActivityStudent(null)}
        />
      )}

      {passwordStudent && (
        <div className="modal-overlay" onClick={() => setPasswordStudent(null)}>
          <div className="modal-content password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set Password for {passwordStudent.name}</h3>
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
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assignStudent && (
        <div className="modal-overlay" onClick={() => setAssignStudent(null)}>
          <div className="modal-content assign-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Assign Teacher to {assignStudent.name}</h3>
              <button className="close-btn" onClick={() => setAssignStudent(null)}>
                &times;
              </button>
            </div>
            <div className="assign-form">
              <div className="form-group">
                <label htmlFor="teacherSelect">Select Teacher</label>
                <select
                  id="teacherSelect"
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="teacher-select"
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.studentCount} students)
                    </option>
                  ))}
                </select>
              </div>
              <div className="current-assignment">
                <span className="label">Current:</span>
                <span className="value">
                  {assignStudent.teacherName || 'Unassigned'}
                </span>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAssignStudent(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAssignTeacher}
                  disabled={isAssigning}
                >
                  {isAssigning ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
