import type { NextFunction, Request, Response } from "express";
import { ApiException, DatabaseException } from "../types/errors";
import { MulterError } from "multer";

/**
 * Error handling middleware
 * 
 * If an ApiException has been encountered, return an
 * error to the user with the proper HTTP response code
 * and error message.
 * 
 * Otherwise, return a 500 error to the client.
 */
export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Handle API Exceptions
    if (err instanceof ApiException) {
        // Log if DatabaseException for debugging purposes
        if (err instanceof DatabaseException) {
            console.error(err)
        }

        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message
        })
    }

    // Handle Multer errors (file upload limit)
    if (err instanceof MulterError) {
        return res.status(400).json({
            error: "FILE_UPLOAD_ERROR",
            message: "An error occured while uploading files to the server"
        })
    }

    // Other errors should be logged and return 500
    console.error(err)

    return res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Internal server error"
    })
}