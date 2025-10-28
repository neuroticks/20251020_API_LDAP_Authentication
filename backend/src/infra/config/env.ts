import path from 'path';
import { config } from 'dotenv';

/**
 * Carrega variáveis de ambiente automaticamente
 * com base no NODE_ENV.
 * 
 * NODE_ENV=TEST → usa .env.test
 * NODE_ENV=PROD → usa .env
 * NODE_ENV=DEV  → usa .env
 */

const envFile =
    process.env.NODE_ENV === 'TEST'
        ? path.resolve(__dirname, '../../.env.test')
        : path.resolve(__dirname, '../../.env');

config({ path: envFile });

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'DEV',
    PORT: process.env.PORT ?? '3000',
    JWT_SECRET: process.env.JWT_SECRET ?? '',
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
};
