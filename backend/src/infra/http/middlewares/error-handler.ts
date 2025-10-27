import { Request, Response, NextFunction } from 'express';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { AppError } from '@/core/errors/app-error';

export function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    // Determina se é AppError (erro previsto) ou erro genérico
    const isAppError = err instanceof AppError;
    const statusCode = isAppError ? err.statusCode : 500;

    // Log estruturado
    logger.error(
        {
            context: 'ErrorHandler',
            method: req.method,
            path: req.path,
            statusCode,
            error: err.message,
            stack: process.env.NODE_ENV === 'PROD' ? undefined : err.stack,
        },
        messages.server.error
    );

    // Resposta padronizada
    return res.status(statusCode).json({
        status: 'error',
        message: isAppError ? err.message : messages.server.error,
    });
}
