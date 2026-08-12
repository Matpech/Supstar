import type { UserJWT } from "../types/users";
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { pool } from "./db";
import { DatabaseException } from "../types/errors";

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

