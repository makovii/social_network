import { Module } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PublicationModule } from './publication/publication.module';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

@Module({
    imports: [
        AuthModule,
        UserModule,
        PublicationModule,
        LoggerModule.forRoot({
            pinoHttp: {
            stream: pino.destination({
              dest: './logs/logs.txt',
              sync: true,
            }),
          },
        }),
    ],
    controllers: [AuthController],
    providers: [
        Neo4jService,
    ],
})
export class AppModule {}
