import { ILdapAuthProvider } from '@/core/ports/ldap-auth-provider';
import { fakeUsers } from './fake-users';

export class FakeLdapProvider implements ILdapAuthProvider {
    async authenticate(email: string, password: string) {
        const user = Object.values(fakeUsers).find((u) => u.email === email);

        if (!user) throw new Error('INVALID_CREDENTIALS');
        if (user.password !== password) throw new Error('INVALID_CREDENTIALS');

        return { email: user.email, roles: user.roles };
    }
}
