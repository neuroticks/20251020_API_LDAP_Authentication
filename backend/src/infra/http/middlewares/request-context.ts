import { AsyncLocalStorage } from "node:async_hooks";
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export interface RequestContext {
    traceId: string;
    userId?: string;
    path?: string;
    method?: string;
}

/**
 * Contexto assíncrono por requisição (compatível com OpenTelemetry).
 * O traceId é um hex de 16 bytes (32 chars).
 */
export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Middleware que cria o contexto de trace e o propaga por toda a requisição.
 * Não depende de autenticação. O userId pode ser setado depois via setUserInRequestContext().
 */
export function requestContextMiddleware(
    req: Request & { user?: { id?: string } },
    _res: Response,
    next: NextFunction
) {
    const traceId = crypto.randomBytes(16).toString("hex");

    const context: RequestContext = {
        traceId,
        userId: req.user?.id, // se existir neste ponto, ótimo; se não, dá pra setar depois
        path: req.originalUrl,
        method: req.method,
    };

    requestContext.run(context, () => next());
}

/**
 * Permite atualizar o userId depois que você o descobrir (ex.: após decodificar JWT em qualquer ponto).
 * Use em qualquer lugar do fluxo da mesma request.
 */
export function setUserInRequestContext(userId: string | undefined) {
    const store = requestContext.getStore();
    if (store) {
        store.userId = userId || undefined;
    }
}
