import type { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken"
import { InvalidTokenException } from "../types/errors";

/**
 * JWT middleware
 * 
 * If the authorization header is set, extract and verify
 * the JWT token before storing it in the Request object.
 * 
 * If the header is not set, req.user is set to null.
 * 
 * If the verification fails, throw an error.
 */
export const jwtMiddleware = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const header = req.headers["authorization"]

    // No authorization header : skip with req.user = null
    if (!header) {
        req.user = null
        return next()
    }

    // Extract and verify the JWT
    const token = header && header.split(" ")[1]
    if (token) {
        try {
            const decoded: unknown = jwt.verify(
                token,
                process.env.JWT_SECRET as jwt.Secret,
                { algorithms: ["HS256"] }
            )

            req.user = decoded as { id: number, username: string }
            return next()
        } catch (error) {
            throw new InvalidTokenException()
        }
    } else {
        req.user = null
    }

    return next()
}