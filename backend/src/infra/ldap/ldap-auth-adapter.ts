import { Client } from 'ldapts';
import { ILdapAuthProvider } from '@/core/ports/ldap-auth-provider';
import { messages } from '@/core/messages/messages';
import { AppError } from '@/core/errors/app-error';
import { env } from '@/infra/config/env';
import { logger } from '@/infra/log/logger';

export class LdapAuthAdapter implements ILdapAuthProvider {
  async authenticate(email: string, password: string): Promise<{ email: string; roles: string[] }> {
    const client = new Client({
      url: env.LDAP_URL,
      timeout: Number(env.LDAP_TIMEOUT_MS ?? 5000),
      connectTimeout: Number(env.LDAP_CONNECT_TIMEOUT_MS ?? 5000),
      strictDN: false,
    });

    const bindDN =
      env.LDAP_BIND_FORMAT === 'DN'
        ? `uid=${email},${env.LDAP_BASE_DN}`
        : email;

    try {
      await client.bind(bindDN, password);
      const roles: string[] = [];

      logger.info({ context: 'LdapAuthAdapter', email }, 'Autenticação LDAP bem-sucedida.');
      return { email, roles };
    } catch (err: any) {
      const msg = String(err?.message || '').toLowerCase();

      // Credenciais inválidas
      if (msg.includes('invalid') || msg.includes('cred')) {
        logger.warn({ context: 'LdapAuthAdapter', email }, 'Credenciais LDAP inválidas.');
        throw new AppError(messages.auth.invalidCredentials, 401);
      }

      // Erros de conexão, indisponibilidade, timeout
      if (
        msg.includes('connect') ||
        msg.includes('socket') ||
        msg.includes('timeout') ||
        msg.includes('unavailable') ||
        msg.includes('refused')
      ) {
        logger.error({ context: 'LdapAuthAdapter', email, err: err?.message }, messages.auth.ldapError);
        throw new AppError(messages.auth.ldapError, 503);
      }

      // Qualquer outro erro é tratado como erro genérico do servidor LDAP
      logger.error({ context: 'LdapAuthAdapter', email, err: err?.message }, messages.auth.ldapError);
      throw new AppError(messages.auth.ldapError, 503);
    } finally {
      try {
        await client.unbind();
      } catch {
        // Ignora falhas de teardown
      }
    }
  }
}
