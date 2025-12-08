import { Response, NextFunction } from 'express';
import { verifyToken, getStudentById } from '../services/auth.service';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Middleware that requires the user to be authenticated as a superuser.
 * Returns 401 if no valid token is provided.
 * Returns 403 if the user is not a superuser.
 */
export async function requireSuperuser(
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

    // Check if the role in the JWT is superuser
    if (decoded.role !== 'superuser') {
      res.status(403).json({ error: 'Superuser access required' });
      return;
    }

    const student = await getStudentById(decoded.studentId);

    if (!student) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Double-check the role from the database
    if (student.role !== 'superuser') {
      res.status(403).json({ error: 'Superuser access required' });
      return;
    }

    req.student = student;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
