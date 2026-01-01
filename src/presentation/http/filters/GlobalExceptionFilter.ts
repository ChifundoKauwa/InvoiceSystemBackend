import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
    InvoiceNotFoundError,
    InvalidInvoiceStateError,
    InvalidInvoiceDataError,
    EventPublishingError,
    ApplicationException,
} from '../../../application/exceptions';

/**
 * PRESENTATION LAYER: Global Exception Filter
 * 
 * Catches application exceptions and maps them to HTTP responses.
 * Separates error handling logic from controllers.
 * Provides consistent error response format.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'An unexpected error occurred';
        let errorType = 'InternalServerError';

        if (exception instanceof InvoiceNotFoundError) {
            statusCode = HttpStatus.NOT_FOUND;
            message = exception.message;
            errorType = 'InvoiceNotFound';
        } else if (exception instanceof InvalidInvoiceStateError) {
            statusCode = HttpStatus.CONFLICT;
            message = exception.message;
            errorType = 'InvalidInvoiceState';
        } else if (exception instanceof InvalidInvoiceDataError) {
            statusCode = HttpStatus.BAD_REQUEST;
            message = exception.message;
            errorType = 'InvalidInvoiceData';
        } else if (exception instanceof EventPublishingError) {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            errorType = 'EventPublishingError';
        } else if (exception instanceof ApplicationException) {
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            errorType = 'ApplicationError';
        } else if (exception instanceof Error) {
            this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
            message = exception.message;
        }

        response.status(statusCode).json({
            error: {
                type: errorType,
                message,
                statusCode,
            },
        });
    }
}
