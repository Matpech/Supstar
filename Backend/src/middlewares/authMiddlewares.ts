import type { NextFunction, Request, Response } from "express";
import { ApiException } from "../types/errors";

/**
 * Throws a 403 ApiException if the user is authenticated.
 * 
 * Use this middleware for endpoints that should not be used
 * while authenticated (for example: register or login)
 */
export const requireLoggedOut = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (req.user) {
        throw new ApiException(403, "AUTHENTICATED", "You must be logged out to perform this operation")
    } else {
        return next()
    }
}

/**
 * Throws a 401 ApiException if the user is not authenticated
 * to ask them to log in.
 * 
 * Use this middleware for endpoints that require authentication.
 */
export const requireLoggedIn = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        throw new ApiException(401, "UNAUTHENTICATED", "You must be logged in to perform this operation")
    } else {
        return next()
    }
}