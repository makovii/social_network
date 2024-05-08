import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Neo4jService } from './neo4j.service';
import { GoogleStrategy } from './auth/google.strategy';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'google' }),
    ],
    controllers: [AuthController],
    providers: [
        Neo4jService,
        GoogleStrategy,
        AuthService,
    ],
})
export class AppModule {}
