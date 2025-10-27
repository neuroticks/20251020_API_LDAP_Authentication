import { Client } from 'ldapts';
import { ILdapAuthProvider } from '@/core/ports/ldap-auth-provider';
import { sanitizeUid } from '@/utils/sanitize-uid';
import { logger } from '@/infra/log/logger';

export class LdapAuthAdapter implements ILdapAuthProvider {
  async authenticate(email: string, password: string) {

    const uid = sanitizeUid(email);
    const client = new Client({
      url: process.env.LDAP_URL!,
      timeout: 5000,
      connectTimeout: 5000,
    });

    const dn = `uid=${uid},${process.env.LDAP_BASE_DN}`;

    try {
      await client.bind(dn, password);
      logger.info({ email }, 'Login LDAP bem-sucedido');
      return { email, roles: ['defaultRole'] };
    } catch (err: any) {
      if (/invalid/i.test(err?.message)) {
        logger.warn({ email }, 'Credenciais inválidas');
        throw new Error('INVALID_CREDENTIALS');
      }
      logger.error({ email, error: err.message }, 'Falha na conexão LDAP');
      throw new Error('LDAP_CONNECTION_ERROR');
    } finally {
      await client.unbind().catch(() => { });
    }
  }
}
