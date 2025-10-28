/**
 * Middleware: Request Context
 * Gera um requestId único e cria um logger filho contextualizado.
 * Permite rastrear toda a requisição nos logs.
 */
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '@/infra/log/logger';

export function requestContext(req: Request, res: Response, next: NextFunction) {
    // Gera um ID único por requisição
    const requestId = randomUUID();

    // Cria um logger filho com contexto
    const childLogger = logger.child({ requestId });

    // Atribui às propriedades do request e response
    req.requestId = requestId;
    req.logger = childLogger;
    res.locals.logger = childLogger;

    // 🆕 devolve o id também no cabeçalho HTTP
    res.setHeader('x-request-id', requestId);

    // Log de início da requisição
    childLogger.info(
        {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
        },
        'Início da requisição'
    );

    // Log automático no final da resposta
    res.on('finish', () => {
        childLogger.info(
            {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                durationMs: Date.now() - startTime,
            },
            'Fim da requisição'
        );
    });

    const startTime = Date.now();
    next();
}
