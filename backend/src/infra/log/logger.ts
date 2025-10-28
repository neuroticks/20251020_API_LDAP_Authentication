import pino, { LoggerOptions, Logger } from 'pino';
import { env } from '@/infra/config/env';

const options: LoggerOptions = {
    level: env.LOG_LEVEL || 'info',
    transport:
        env.NODE_ENV === 'test'
            ? {
                target: 'pino-pretty',
                options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
            }
            : undefined,
};

export const baseLogger: Logger = pino(options);

/**
 * Logger aprimorado com sobrecarga para aceitar:
 * logger.info('mensagem')
 * logger.info({ contexto }, 'mensagem')
 */
export const logger = {
    info(objOrMsg: any, maybeMsg?: string) {
        if (typeof objOrMsg === 'string') return baseLogger.info(objOrMsg);
        return baseLogger.info(objOrMsg, maybeMsg);
    },
    error(objOrMsg: any, maybeMsg?: string) {
        if (typeof objOrMsg === 'string') return baseLogger.error(objOrMsg);
        return baseLogger.error(objOrMsg, maybeMsg);
    },
    warn(objOrMsg: any, maybeMsg?: string) {
        if (typeof objOrMsg === 'string') return baseLogger.warn(objOrMsg);
        return baseLogger.warn(objOrMsg, maybeMsg);
    },
    debug(objOrMsg: any, maybeMsg?: string) {
        if (typeof objOrMsg === 'string') return baseLogger.debug(objOrMsg);
        return baseLogger.debug(objOrMsg, maybeMsg);
    },
    child(bindings: Record<string, unknown>) {
        return baseLogger.child(bindings);
    },
};

export type AppLogger = typeof logger;
