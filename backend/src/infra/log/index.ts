import { logger } from './logger';

if (!(global as any).logger) {
    (global as any).logger = logger;
}

export { logger };
