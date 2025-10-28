// src/infra/di/container.ts
import { FakeLdapProvider } from '@/infra/ldap/fake-ldap-provider';
import { LdapAuthAdapter } from '@/infra/ldap/ldap-auth-adapter';
import { JwtService } from '@/infra/jwt/jwt-service';
import { env } from '@/infra/config/env';

export type DependencyTokens = {
  ILdapAuthProvider: FakeLdapProvider | LdapAuthAdapter;
  JwtService: JwtService;
};

export class Container {
  private static instances = new Map<keyof DependencyTokens, any>();
  private static initialized = false;

  static init() {
    if (this.initialized) return; // idempotente

    // Usa FakeLdapProvider em ambiente de teste, senão o adapter real
    const ldapProvider =
      env.NODE_ENV === 'test' ? new FakeLdapProvider() : new LdapAuthAdapter();

    const jwtService = new JwtService();

    this.instances.set('ILdapAuthProvider', ldapProvider);
    this.instances.set('JwtService', jwtService);

    this.initialized = true;
  }

  static resolve<K extends keyof DependencyTokens>(token: K): DependencyTokens[K] {
    // 🔒 Fail-safe: se alguém resolver antes do init explícito (ex.: em imports), auto-init
    if (!this.initialized) this.init();

    const instance = this.instances.get(token);
    if (!instance) throw new Error(`Dependência não registrada: ${token}`);
    return instance as DependencyTokens[K];
  }

  // Útil em testes específicos se precisar resetar manualmente
  static _resetForTests() {
    this.instances.clear();
    this.initialized = false;
  }
}
