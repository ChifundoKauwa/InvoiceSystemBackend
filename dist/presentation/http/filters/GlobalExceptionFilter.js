"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const exceptions_1 = require("../../../application/exceptions");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'An unexpected error occurred';
        let errorType = 'InternalServerError';
        if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = exceptionResponse.message || exception.message;
            }
            errorType = exception.constructor.name;
            response.status(statusCode).json(exceptionResponse);
            return;
        }
        if (exception instanceof exceptions_1.InvoiceNotFoundError) {
            statusCode = common_1.HttpStatus.NOT_FOUND;
            message = exception.message;
            errorType = 'InvoiceNotFound';
        }
        else if (exception instanceof exceptions_1.InvalidInvoiceStateError) {
            statusCode = common_1.HttpStatus.CONFLICT;
            message = exception.message;
            errorType = 'InvalidInvoiceState';
        }
        else if (exception instanceof exceptions_1.InvalidInvoiceDataError) {
            statusCode = common_1.HttpStatus.BAD_REQUEST;
            message = exception.message;
            errorType = 'InvalidInvoiceData';
        }
        else if (exception instanceof exceptions_1.EventPublishingError) {
            statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            errorType = 'EventPublishingError';
        }
        else if (exception instanceof exceptions_1.ApplicationException) {
            statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = exception.message;
            errorType = 'ApplicationError';
        }
        else if (exception instanceof Error) {
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
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=GlobalExceptionFilter.js.map