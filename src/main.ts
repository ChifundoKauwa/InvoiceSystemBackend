import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { JwtAuthGuard } from './auth/guards/jwt.guard';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn'],
    });

    // CORS - Allow frontend from any origin (for development)
    
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'https://invoicesystembackend-1.onrender.com',
        process.env.FRONTEND_URL,
    ].filter(Boolean);

    app.enableCors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                //allow all origins
                if (process.env.NODE_ENV === 'development') {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix(process.env.APP_PREFIX || 'api');

    // Global validation pipe
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

    // JWT Guard 
    app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

    const port = process.env.APP_PORT || 3000;
    await app.listen(port);
    console.log(`Application started on port ${port}`);
}

bootstrap().catch((err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
