import { describe, it, expect } from 'vitest';
import { AuthSchema } from '@/core/domain/validation/auth.schema';
import { messages } from '@/core/messages/messages';

describe('AuthSchema (validação com Zod)', () => {
    it('deve falhar quando email estiver vazio', () => {
        const result = AuthSchema.safeParse({ email: '', password: '123' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe(messages.auth.missingEmail);
    });

    it('deve falhar quando senha estiver vazia', () => {
        const result = AuthSchema.safeParse({ email: 'user@dominio.com', password: '' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe(messages.auth.missingPassword);
    });

    it('deve falhar com formato de email inválido', () => {
        const result = AuthSchema.safeParse({ email: 'sem-arroba', password: '123' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe(messages.auth.invalidEmailFormat);
    });

    it('deve falhar quando email for muito longo', () => {
        const longEmail = 'a'.repeat(151) + '@dominio.com';
        const result = AuthSchema.safeParse({ email: longEmail, password: '123' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe(messages.auth.invalidEmailLength);
    });

    it('deve falhar quando senha for muito longa', () => {
        const longPassword = 'a'.repeat(151);
        const result = AuthSchema.safeParse({ email: 'user@dominio.com', password: longPassword });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe(messages.auth.invalidPasswordLength);
    });

    it('deve passar com dados válidos', () => {
        const result = AuthSchema.safeParse({ email: 'user@dominio.com', password: '123' });
        expect(result.success).toBe(true);
    });
});
