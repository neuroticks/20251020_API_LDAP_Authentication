/**
 * Sanitiza o UID (parte antes do @ do email) para evitar LDAP Injection.
 */
export function sanitizeUid(email: string): string {
    const [uidRaw] = email.split('@');
    return uidRaw.replace(/[^a-zA-Z0-9._-]/g, '');
}
