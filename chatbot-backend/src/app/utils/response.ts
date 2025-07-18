import {Response} from 'express';

/**
 * Send success response
 */
export const sendSuccessResponse = (
    res: Response,
    message: string,
    data: Record<string, unknown> = {},
    statusCode: number = 200
): void => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        errors: null
    });
};

/**
 * Send error response
 */
export const sendErrorResponse = (
    res: Response,
    message: string,
    errors: Record<string, unknown> | null = null,
    statusCode: number = 400
): void => {
    res.status(statusCode).json({
        success: false,
        message,
        data: null,
        errors
    });
}; 