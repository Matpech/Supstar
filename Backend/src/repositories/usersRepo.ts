import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { UserRegistration } from "../types/users";
import { pool } from "../utils/db";
import { hashSync } from "bcrypt";

/**
 * Register a new user account in the database
 * 
 * @param user Account details of the user to insert
 * @returns The unique ID of the new user
 * @throws ApiException (409, username/email/discord already taken) or
 * DatabaseException (500, Internal server error)
 */
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

/**
 * Delete a user account from the database
 * 
 * @param userId The unique ID of the user to delete
 * @throws DatabaseException (500, Internal server error)
 */
export const deleteUser = async (userId: number) => {
    try {
        await pool.query(
            "DELETE FROM users WHERE id = $1",
            [userId]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch a single user by ID
 * 
 * @param userId The unique ID of the user to fetch
 * @returns The user's data (or `null` if not found)
 * @throws DatabaseException (500, Internal server error)
 */
export const getOneUserById = async (userId: number) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, discord_id FROM users WHERE id = $1",
            [userId]
        )

        return result.rows[0] ?? null
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch a single user by Discord ID
 * 
 * This function is mostly used for the Discord Oauth2 process to figure out
 * whether to create a new account in the database or only generate credentials
 * if the account is already registered
 * 
 * @param discordId The Discord ID of the user to fetch
 * @returns The user's data (or `null` if not found)
 * @throws DatabaseException (500, Internal server error)
 */
export const getOneUserByDiscordId = async (discordId: string) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, discord_id FROM users WHERE discord_id = $1",
            [discordId]
        )

        return result.rows[0] ?? null
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch a single user by unique username
 * 
 * Note: this function is **NOT** a user search feature, it is made to match an
 * exact username in the database to verify it the user exists or not.
 * 
 * @param username The username to look for in the database
 * @returns The user's data (or `null` if not found)
 * @throws DatabaseException (500, Internal server error)
 */
export const getOneUserByUsername = async (username: string) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, discord_id FROM users WHERE username = $1",
            [username]
        )

        return result.rows[0] ?? null
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch statistics about a given user. This function collects :
 * - The number of locations in the user's personal list
 * - The number of reviews published by the user
 * - The average rating given by the user
 * - The number of shared lists owned by the user
 * 
 * Note: the functions throws an error if the user does not exist
 * 
 * @param userId The unique ID of the user
 * @returns Statistics about the user
 * @throws NotFoundException or DatabaseException (500 Internal server error)
 */
export const getUserStats = async (userId: number) => {
    try {
        const result = await pool.query(
            `
                SELECT
                    (
                        SELECT COUNT(*)
                        FROM locations
                        WHERE user_id = $1
                    )::integer AS personal_locations,
                    (
                        SELECT COUNT(*)
                        FROM reviews
                        WHERE reviewer_id = $1
                    )::integer AS reviews_published,
                    (
                        SELECT ROUND(AVG(rating), 2)
                        FROM reviews
                        WHERE reviewer_id = $1
                    )::real AS average_rating,
                    (
                        SELECT COUNT(*)
                        FROM shared_lists
                        WHERE owner_id = $1
                    )::integer AS lists_owned
                FROM users
                WHERE id = $1
            `, [userId]
        )

        if (!result.rows[0]) {
            throw new NotFoundException("User")
        }

        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

export const exportPersonalListLocations = async (userId: number) => {
    try {
        const result = await pool.query(
            `
                SELECT
                    l.name,
                    l.category,
                    l.description,
                    l.opening_times,
                    l.tags,
                    l.status,
                    l.full_address,
                    l.city,
                    l.country_code,
                    l.latitude,
                    l.longitude,
                    l.price,
                    ROUND(AVG(r.rating), 2)::real AS average_rating,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'username', u.username,
                                'rating', r.rating,
                                'comment', r.comment
                            )
                        ) FILTER (WHERE r.id IS NOT NULL), '[]'::json
                    ) AS reviews
                FROM locations l
                LEFT JOIN reviews r ON r.location_id = l.id
                LEFT JOIN users u ON u.id = r.reviewer_id
                WHERE l.user_id = $1
                GROUP BY l.id
            `, [userId]
        )

        if (result.rowCount === 0) {
            throw new ApiException(404, "EXPORT_NO_DATA", "There is no data to export")
        }

        return result.rows
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}