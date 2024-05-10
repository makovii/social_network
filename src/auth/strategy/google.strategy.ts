import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Neo4jService } from '../../neo4j.service';
import { User } from '../../user/user.model';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
import { AuthService } from '../auth.service';
dotenv.config()


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly neo4jService: Neo4jService, private readonly authService: AuthService) {
        super({
            clientID: env.get('GOOGLE_CLIENT_ID').required().asString(),
            clientSecret: env.get('GOOGLE_CLIENT_SECRET').required().asString(),
            callbackURL: 'http://localhost:3000/auth/google/callback',
            passReqToCallback: true,
            scope: ['profile', 'email'],
        });
    }

    async validate(request: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        try {
            const googleId = profile.id;
            const email = profile.emails[0].value;

            let user = await this.neo4jService.getUserByEmail(email);

            if (!user) {
                user = await this.neo4jService.createUser(new User({ googleId, email, password: '' }));
            }

            request.user = { googleId, email, id: user.id };

            const { accessToken } = await this.authService.generateJwtToken(user);

            done(null, { googleId, email, accessToken });
        } catch (err) {
            done(err, false);
        }
    }
}
