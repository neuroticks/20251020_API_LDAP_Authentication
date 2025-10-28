import type { AppLogger } from './logger';

declare global {
    // logger acessível globalmente (ex: logger.info(...))
    const logger: AppLogger;
}

export { };
