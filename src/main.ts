import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors();
    const port = 3000;
    await app.listen(port);
    console.log(`http://localhost:${port}`);
}
bootstrap();
