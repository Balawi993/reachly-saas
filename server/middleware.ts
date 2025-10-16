import { Request, Response, NextFunction } from 'express';
import { checkSubscriptionLimit } from './subscription';
import logger from './logger';

/**
 * Admin middleware - check if user is admin
 */
export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    logger.warn('Non-admin user attempted to access admin endpoint', { 
      userId: req.user.id, 
      email: req.user.email 
    });
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

/**
 * Subscription limit middleware factory
 */
export const checkLimit = (action: string) => {
  return async (req: any, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      await checkSubscriptionLimit(req.user.id, action);
      next();
    } catch (error) {
      logger.warn('Subscription limit reached', { 
        userId: req.user.id, 
        action, 
        error: (error as Error).message 
      });
      return res.status(403).json({ 
        error: (error as Error).message,
        limitReached: true,
        action
      });
    }
  };
};
