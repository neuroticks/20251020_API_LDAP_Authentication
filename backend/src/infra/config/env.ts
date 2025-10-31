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
    process.env.NODE_ENV === 'test'
        ? path.resolve(process.cwd(), '.env.test')
        : path.resolve(process.cwd(), '.env');

config({ path: envFile });

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'test',
    PORT: process.env.PORT ?? '3000',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || '',
    JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS512',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30m',
    JWT_ISSUER: process.env.JWT_ISSUER || 'auth-service',

    // LDAP
    LDAP_URL: process.env.LDAP_URL || 'ldap://localhost:389',
    LDAP_BASE_DN: process.env.LDAP_BASE_DN || 'dc=example,dc=com',
    LDAP_BIND_FORMAT: process.env.LDAP_BIND_FORMAT || 'UPN', // ou 'DN'
    LDAP_SEARCH_BASE: process.env.LDAP_SEARCH_BASE || 'ou=users,dc=example,dc=com',
    LDAP_TIMEOUT_MS: process.env.LDAP_TIMEOUT_MS || '5000',
    LDAP_CONNECT_TIMEOUT_MS: process.env.LDAP_CONNECT_TIMEOUT_MS || '5000',

    // Rate Limit
    RATE_LIMIT_WINDOW_MIN: process.env.RATE_LIMIT_WINDOW_MIN || '15',
    RATE_LIMIT_MAX_ATTEMPTS: process.env.RATE_LIMIT_MAX_ATTEMPTS || '5',

    // LOG
    LOG_LEVEL: process.env.LOG_LEVEL ?? 'info',
};
