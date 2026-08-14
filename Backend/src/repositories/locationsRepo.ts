import { ApiException, DatabaseException } from "../types/errors";
import type { Location } from "../types/locations";
import { pool } from "../utils/db";

export const createLocation = async (data: Location) => {
    try {
        const result = await pool.query(
            `
                INSERT INTO locations
                (
                    user_id,
                    list_id,
                    name,
                    category,
                    description,
                    opening_times,
                    tags,
                    status,
                    full_address,
                    city,
                    country_code,
                    latitude,
                    longitude
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `,
            [
                data.user_id,
                data.list_id,
                data.name,
                data.category,
                data.description,
                JSON.stringify(data.opening_times),
                JSON.stringify(data.tags),
                data.status,
                data.full_address,
                data.city,
                data.country_code,
                data.latitude,
                data.longitude
            ]
        )

        return result.rows[0]
    } catch (error) {
        if (error instanceof Error && "code" in error && "constraint" in error) {
            switch (error.code) {
                case "23503":
                    throw new ApiException(409, "INVALID_ID", "User or List ID invalid")
            
                default:
                    throw new DatabaseException(error)
            }
        }
    }
}