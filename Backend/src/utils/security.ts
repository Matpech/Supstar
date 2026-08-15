import type { LoginCredentials, UserJWT } from "../types/security";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { compareSync, hashSync } from "bcrypt"
import { pool } from "./db";
import { ApiException, DatabaseException, NotFoundException } from "../types/errors";

const TOKEN_LIFESPAN: string = process.env.JWT_LIFESPAN || "15m"

/**
 * Sign a new JWT access token with the user's public information
 * 
 * @param data The data to put in the JWT (id and username)
 * @returns The generated JWT
 */
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

/**
 * Generate a random 64 character hexadecimal session ID and save it in the
 * database to be used for API authentication (refreshing the access token)
 * 
 * @param userId The unique ID of the user that owns the session
 * @returns The generated session ID
 * @throws DatabaseException (500, Internal server error)
 */
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

/**
 * Checks if an email/password combination is valid.
 * 
 * The API won't mention which specific value is invalid for security and
 * privacy reasons (it will return the same error: "Email or password incorrect")
 * 
 * @param credentials The email and password to verify
 * @returns Relevant user information to create a JWT
 * @throws ApiException (401, INVALID_LOGIN) or DatabaseException (500, Internal
 * server error)
 */
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

/**
 * Checks if a valid session ID is valid during an access token refresh procedure.
 * 
 * @param sessionId The 64 character session ID to verify
 * @returns Relevant user information to regenerate a new JWT
 * @throws ApiException (401, INVALID_SESSION_ID) or DatabaseException (500, Internal
 * server error)
 */
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

/**
 * Invalidates a session by deleting the session ID from the database
 * 
 * @param sessionId The session ID to delete
 * @throws DatabaseException (500, Internal server error)
 */
export async function invalidateSessionId(sessionId: string) {
    try {
        await pool.query(
            "DELETE FROM active_sessions WHERE id = $1",
            [sessionId]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Invalidate every session of a user.
 * 
 * An additional parameter can be passed to add an exception (invalidating
 * every session except the active one)
 * 
 * @param userId The ID of the user requesting the mass invalidation
 * @param except The session ID to keep active (optional)
 * @throws DatabaseException (500, Internal server error)
 */
export async function invalidateAllSessionIds(userId: number, except?: string) {
    try {
        await pool.query(
            "DELETE FROM active_sessions WHERE user_id = $1 AND ($2::varchar IS NULL OR id <> $2::varchar)",
            [userId, except ?? null]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Verify if a password matches the password of the specified user's ID in the database
 * 
 * Unlike the `verifyLoginCredentials` function, it is not intended to be used in a login
 * process. This function is intended for password prompts while the user is authenticated
 * (for example, in a password update form or in a confirmation prompt for a dangerous action)
 * 
 * @param userId The unique user ID
 * @param password The password to verify
 * @throws NotFoundException, ApiException (401, INCORRECT_PASSWORD) or DatabaseException
 * (500, Internal server error)
 */
export async function verifyPassword(userId: number, password: string) {
    try {
        const result = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [userId]
        )

        if (!result.rows[0]) {
            throw new NotFoundException("User")
        }

        if (!compareSync(password, result.rows[0].password)) {
            throw new ApiException(401, "INCORRECT_PASSWORD", "Password is invalid")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Update the password of a given user.
 * 
 * This function performs the hashing operation using bcrypt.
 * 
 * @param userId The unique ID of the user that requested the password update
 * @param newPassword The new password (non hashed)
 * @throws DatabaseException (500, Internal server error)
 */
export async function updatePassword(userId: number, newPassword: string) {
    const hashedPassword = hashSync(newPassword, 12)

    try {
        await pool.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [hashedPassword, userId]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}
