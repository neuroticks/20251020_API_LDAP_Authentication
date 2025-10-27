import { Request, Response, NextFunction } from 'express';

/**
 * Middleware utilitário para capturar erros em handlers assíncronos.
 * Garante que exceções sejam passadas corretamente ao errorHandler global.
 */
export const asyncHandler =
    (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
        (req: Request, res: Response, next: NextFunction) =>
            Promise.resolve(fn(req, res, next)).catch(next);
