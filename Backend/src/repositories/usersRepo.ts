import { ApiException, DatabaseException } from "../types/errors";
import type { UserRegistration } from "../types/users";
import { pool } from "../utils/db";
import { hashSync } from "bcrypt";

export const createUser = async (user: UserRegistration) => {
    try {
        const hashedPassword = user.password
            ? hashSync(user.password, 12)
            : null

        const result = await pool.query(
            "INSERT INTO users (email, username, password, discord_id) VALUES ($1, $2, $3, $4) RETURNING id",
            [user.email, user.username, hashedPassword, user.discord_id]
        )

        return result.rows[0].id
    } catch (error) {
        if (error instanceof Error && "code" in error && "constraint" in error) {
            switch (error.code) {
                case "23505":
                    // Unique constraint violation
                    switch (error.constraint) {
                        case "users_username_key":
                            throw new ApiException(409, "USERNAME_TAKEN", "Username already taken")

                        case "users_email_key":
                            throw new ApiException(409, "EMAIL_TAKEN", "Email already taken")
                    
                        case "users_discord_id_key":
                            throw new ApiException(409, "DISCORD_TAKEN", "This discord account has already been registered")
                    }
                    break;
            
                default:
                    throw new DatabaseException(error)
            }
        }
    }
}