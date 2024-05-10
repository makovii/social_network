import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtModule } from '@nestjs/jwt';
import * as env from 'env-var';
import * as dotenv from 'dotenv'
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { Neo4jService } from '../neo4j.service';
dotenv.config()

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'google' }),
        JwtModule.register({
            secret: env.get('PRIVATE_KEY').default('SOME_MSG').required().asString(),
            signOptions: {
              expiresIn: '24h',
            },
        }),
    ],
    controllers: [AuthController],
    providers: [
        GoogleStrategy,
        JwtStrategy,
        AuthService,
        Neo4jService,
    ],
    exports: [JwtModule, AuthService, PassportModule]
})
export class AuthModule {}
