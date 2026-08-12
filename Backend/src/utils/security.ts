import type { LoginCredentials, UserJWT } from "../types/security";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { compareSync } from "bcrypt"
import { pool } from "./db";
import { ApiException, DatabaseException } from "../types/errors";

const TOKEN_LIFESPAN: string = process.env.JWT_LIFESPAN || "15m"

export function signToken(data: UserJWT) {
    return jwt.sign(
        data,
        process.env.JWT_SECRET as jwt.Secret,
        {
            expiresIn: TOKEN_LIFESPAN,
            algorithm: "HS256"
        } as jwt.SignOptions
    )
}

export async function generateSessionToken(userId: number): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString("hex")

    try {
        await pool.query(
            "INSERT INTO active_sessions (id, user_id) VALUES ($1, $2)",
            [sessionId, userId]
        )

        return sessionId
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

export async function verifyLoginCredentials(credentials: LoginCredentials) {
    try {
        const result = await pool.query(
            "SELECT id, username, password FROM users WHERE email = $1",
            [credentials.email]
        )

        if (!result.rows[0]) {
            throw new ApiException(401, "INVALID_LOGIN", "Email or password incorrect")
        }

        if (compareSync(credentials.password, result.rows[0].password)) {
            return {
                id: result.rows[0].id,
                username: result.rows[0].username
            }
        } else {
            throw new ApiException(401, "INVALID_LOGIN", "Email or password incorrect")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

export async function verifySessionId(sessionId: string) {
    try {
        const result = await pool.query(
            "SELECT s.user_id AS id, u.username FROM active_sessions s INNER JOIN users u ON s.user_id = u.id WHERE s.id = $1 AND s.expires_at > NOW()",
            [sessionId]
        )

        if (!result.rows[0]) {
            throw new ApiException(401, "INVALID_SESSION_ID", "Your session ID is invalid or has expired")
        }

        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

