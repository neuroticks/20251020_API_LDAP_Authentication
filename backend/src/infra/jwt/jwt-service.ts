import jwt, { JwtPayload, SignOptions, Algorithm } from 'jsonwebtoken';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { env } from '@/infra/config/env';

export class JwtService {
  private static get secret(): string {
    const secret = env.JWT_SECRET;
    if (!secret) {
      logger.error({ context: 'JwtService' }, messages.jwt.missingSecret);
      throw new Error(messages.jwt.missingSecret);
    }
    return secret;
  }

  private static readonly algorithm: Algorithm = 'HS512';

  static sign(payload: object, expiresIn: SignOptions['expiresIn'] = '30m'): string {
    const options: SignOptions = { expiresIn, algorithm: this.algorithm };

    const token = jwt.sign(payload, this.secret, options);

    logger.debug({ context: 'JwtService' }, messages.jwt.created);

    return token;
  }

  static verify(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ['HS512'] }) as JwtPayload;
      logger.debug({ context: 'JwtService' }, messages.jwt.verified);
      return decoded;
    } catch (err: any) {
      logger.warn({ context: 'JwtService', error: err.message }, messages.jwt.invalid);
      throw new Error(messages.jwt.invalid);
    }
  }
}
