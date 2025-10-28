import { fakeUsers } from './fake-users';

export class FakeLdapProvider {
  async authenticate(email: string, password: string): Promise<boolean> {
    const user = Object.values(fakeUsers).find(
      (u) => u.email === email && u.password === password,
    );
    return !!user;
  }

  async getUserRoles(email: string): Promise<string[]> {
    const user = Object.values(fakeUsers).find((u) => u.email === email);
    return user ? user.roles : [];
  }
}
