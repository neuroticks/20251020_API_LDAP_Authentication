import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@/infra/jwt/jwt-service';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn({ context: 'EnsureAuthenticated' }, messages.jwt.missingToken);
    return res.status(401).json({ message: messages.jwt.missingToken });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = JwtService.verify(token);
    req.user = decoded;
    logger.debug({ context: 'EnsureAuthenticated', user: decoded.email }, messages.jwt.verified);
    return next();
  } catch (error: any) {
    logger.error({ context: 'EnsureAuthenticated', error: error.message }, messages.jwt.invalid);
    return res.status(401).json({ message: messages.jwt.invalid });
  }
}
