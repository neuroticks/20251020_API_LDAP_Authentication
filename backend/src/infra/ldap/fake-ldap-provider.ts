import { ILdapAuthProvider } from '../../core/ports/ldap-auth-provider';
import { fakeUsers } from '../../tests/fakes/fake-users';

export class FakeLdapProvider implements ILdapAuthProvider {
    async authenticate(email: string, password: string) {
        const user = Object.values(fakeUsers).find((u) => u.email === email);

        if (!user || user.password !== password) {
            throw new Error('INVALID_CREDENTIALS');
        }

        return { email: user.email, roles: user.roles };
    }
}