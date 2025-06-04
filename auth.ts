import { Request, Response, NextFunction } from 'express';

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized. Please log in to access this resource.' });
  }
  next();
};