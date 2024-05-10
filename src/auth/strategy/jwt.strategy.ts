import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
dotenv.config()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.get('PRIVATE_KEY').default('SOME_MSG').required().asString(),
    });
  }

  async validate(payload: { email: string, id: string, googleId: string }) {
    return {
        // elementId: payload.elementId,
        googleId: payload.googleId,
        email: payload.email,
        id: payload.id,
    };
  }
}
