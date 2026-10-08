import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'apex_chronicle_secure_production_secret_key_89234';
const INITIAL_ADMIN_EMAIL = 'myall5148@gmail.com';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_initial_admin: number;
}

export function signToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      is_initial_admin: user.is_initial_admin
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
  } catch {
    return null;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  // Double-check user still exists in database
  const user = db.prepare('SELECT id, email, name, role, is_initial_admin FROM users WHERE id = ?').get(payload.id) as any;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: User account no longer exists' });
    return;
  }

  (req as any).user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthenticatedUser;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized: Authentication required' });
    return;
  }
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    res.status(403).json({ error: 'Access Denied: Administrator clearance required' });
    return;
  }
  next();
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as AuthenticatedUser;
  if (!user || (user.role !== 'superadmin' && user.is_initial_admin !== 1)) {
    res.status(403).json({ error: 'Forbidden: Super administrator privileges required' });
    return;
  }
  next();
}

export { INITIAL_ADMIN_EMAIL };
