import type { NextFunction, Request, Response } from "express";
import { ApiException } from "../types/errors";

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Handle API Exceptions
    if (err instanceof ApiException) {
        return res.status(err.statusCode).json({
            error: err.code,
            message: err.message
        })
    }

    // Other errors should be logged and return 500
    console.error(err)

    return res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Internal server error"
    })
}