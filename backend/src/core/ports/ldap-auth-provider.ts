export interface ILdapAuthProvider {
    authenticate(email: string, password: string): Promise<{
        email: string;
        roles: string[];
    }>;
}