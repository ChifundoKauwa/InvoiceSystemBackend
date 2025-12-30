import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import 'reflect-metadata';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn'],
    });

    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix(process.env.APP_PREFIX || 'api');

    // Global validation pipe (validates DTOs)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // Global response serialization
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    const port = process.env.APP_PORT || 3000;
    await app.listen(port);
    console.log(` Application started on port ${port}`);
}

bootstrap().catch((err) => {
    console.error(' Failed to start application:', err);
    process.exit(1);
});

