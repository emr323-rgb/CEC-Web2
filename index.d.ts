import { Request, Response, NextFunction } from 'express';

declare module '../middleware/auth' {
  export function authenticate(req: Request, res: Response, next: NextFunction): void;
}