import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { Location, LocationUpdateArgs } from "../types/locations";
import { pool } from "../utils/db";
import fs from "fs"

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

export const updateLocation = async (locationId: number, newDetails: LocationUpdateArgs) => {
    // Build SQL query dynamically
    const fields = [];
    const values = [];
    let index = 1;

    if (newDetails.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(newDetails.name);
    }

    if (newDetails.category !== undefined) {
      fields.push(`category = $${index++}`);
      values.push(newDetails.category);
    }

    if (newDetails.description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(newDetails.description);
    }

    if (newDetails.opening_times !== undefined) {
        fields.push(`opening_times = $${index++}`);
        values.push(JSON.stringify(newDetails.opening_times));
    }

    if (newDetails.tags !== undefined) {
        fields.push(`tags = $${index++}`);
        values.push(JSON.stringify(newDetails.tags));
    }

    if (newDetails.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(newDetails.status);
    }

    if (newDetails.full_address !== undefined) {
      fields.push(`full_address = $${index++}`);
      values.push(newDetails.full_address);
    }

    if (newDetails.city !== undefined) {
      fields.push(`city = $${index++}`);
      values.push(newDetails.city);
    }

    if (newDetails.country_code !== undefined) {
      fields.push(`country_code = $${index++}`);
      values.push(newDetails.country_code);
    }

    if (newDetails.latitude !== undefined) {
      fields.push(`latitude = $${index++}`);
      values.push(newDetails.latitude);
    }

    if (newDetails.longitude !== undefined) {
      fields.push(`longitude = $${index++}`);
      values.push(newDetails.longitude);
    }
    
    values.push(locationId)
    const sqlQuery = `UPDATE locations SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`

    // Execute the query
    try {
        const result = await pool.query(sqlQuery, values)

        if (!result.rows[0]) {
            throw new NotFoundException("Location")
        }

        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

export const deleteLocation = async (locationId: number) => {
    try {
        const result = await pool.query(
            "DELETE FROM locations WHERE id = $1",
            [locationId]
        )

        if (result.rowCount === 0) {
            throw new NotFoundException("Location")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

export const addPhotoToIndex = async (locationId: number, photoId: string) => {
    try {
        await pool.query(
            "INSERT INTO gallery (id, location_id) VALUES ($1, $2)",
            [photoId, locationId]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

export const deletePhoto = async (imageId: string) => {
    try {
        // Remove from the index
        const result = await pool.query(
            "DELETE FROM gallery WHERE id = $1",
            [imageId]
        )

        if (result.rowCount === 0) {
            throw new NotFoundException("Photo")
        }

        // Delete the file
        fs.unlinkSync(`/data/photos/${imageId}.webp`)
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}