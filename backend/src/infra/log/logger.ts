import pino from 'pino';
import { env } from '@/infra/config/env';

export const logger = pino({
    level: env.NODE_ENV === 'PROD' ? 'info' : 'debug',
    transport:
        env.NODE_ENV === 'PROD'
            ? undefined // Em produção, saída pura em JSON
            : {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                },
            },
});
