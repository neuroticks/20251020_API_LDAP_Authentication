import { ILdapAuthProvider } from '@/core/ports/ldap-auth-provider';
import { LdapAuthAdapter } from '@/infra/ldap/ldap-auth-adapter';
import { FakeLdapProvider } from '@/infra/ldap/fake-ldap-provider';

/**
 * Define todos os tipos de dependências conhecidas no sistema.
 * Cada chave é o "token" usado para registrar/obter a instância.
 */
type DependencyTokens = {
    ILdapAuthProvider: ILdapAuthProvider;
};

export class Container {
    private static instances = new Map<keyof DependencyTokens, unknown>();

    static registerDependencies() {
        const env = process.env.NODE_ENV;

        if (env === 'PROD') {
            this.instances.set('ILdapAuthProvider', new LdapAuthAdapter());
        } else {
            this.instances.set('ILdapAuthProvider', new FakeLdapProvider());
        }
    }

    static resolve<K extends keyof DependencyTokens>(token: K): DependencyTokens[K] {
        const instance = this.instances.get(token);
        if (!instance) throw new Error(`Dependência não registrada: ${token}`);
        return instance as DependencyTokens[K];
    }
}
