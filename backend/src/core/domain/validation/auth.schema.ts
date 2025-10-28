import { z } from 'zod';
import { messages } from '@/core/messages/messages';

/**
 * Esquema de validação de credenciais compatível com Zod v4.1.12+.
 * Usa refinements em vez de mensagens diretas nos métodos preteridos.
 */
export const AuthSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: messages.auth.missingEmail })
    .max(150, { message: messages.auth.invalidEmailLength ?? 'Email muito longo.' })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: messages.auth.invalidEmailFormat ?? 'Formato de email inválido.',
    }),
  password: z
    .string()
    .trim()
    .min(1, { message: messages.auth.missingPassword ?? 'O campo senha é obrigatório.' })
    .max(150, { message: messages.auth.invalidPasswordLength ?? 'Senha muito longa.' }),
});

export type AuthSchemaType = z.infer<typeof AuthSchema>;
