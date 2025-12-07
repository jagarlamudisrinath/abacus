import { Response, NextFunction } from 'express';
import { verifyToken, getStudentById } from '../services/auth.service';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Middleware that requires authentication.
 * Returns 401 if no valid token is provided.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyToken(token);
    const student = await getStudentById(decoded.studentId);

    if (!student) {
      res.status(401).json({ error: 'Student not found' });
      return;
    }

    req.student = student;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware that optionally attaches the student if a valid token is provided.
 * Continues without error if no token is present.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      const student = await getStudentById(decoded.studentId);
      if (student) {
        req.student = student;
      }
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  next();
}
