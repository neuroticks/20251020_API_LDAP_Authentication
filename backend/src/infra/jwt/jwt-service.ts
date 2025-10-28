import jwt, { VerifyOptions, SignOptions, Algorithm } from 'jsonwebtoken';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { env } from '@/infra/config/env';

export class JwtService {
  private readonly secret: string;
  private readonly algorithm: Algorithm;
  private readonly expiresIn: SignOptions['expiresIn'];

  constructor() {
    this.secret = env.JWT_SECRET;
    if (!this.secret) {
      logger.error({ context: 'JwtService' }, messages.jwt.missingSecret);
      throw new Error(messages.jwt.missingSecret);
    }
    this.algorithm = 'HS512';
    this.expiresIn = '30m';
  }

  sign(payload: object): string {
    const options: SignOptions = { expiresIn: this.expiresIn, algorithm: this.algorithm };

    const token = jwt.sign(payload, this.secret, options);

    logger.debug({ context: 'JwtService' }, messages.jwt.created);

    return token;
  }

  verify<T = any>(token: string): T {
    const options: VerifyOptions = { algorithms: [this.algorithm] };
    return jwt.verify(token, this.secret, options) as T;
  }
}


