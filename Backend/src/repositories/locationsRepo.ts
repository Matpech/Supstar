import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { Location, LocationUpdateArgs } from "../types/locations";
import { pool } from "../utils/db";
import fs from "fs"

/**
 * Create a new location in the database. This function can create locations
 * for personal lists (tied to an account) and shared lists depending on the
 * fields in the data parameter.
 * 
 * @param data Information about the location to create (ids, metadata and
 * geographic information)
 * @returns The inserted location in the database
 * @throws ApiException (409, invalid ID) or DatabaseException (500, Internal
 * server error)
 */
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

/**
 * Update details of an existing location in the database using its id.
 * 
 * This function includes two optional parameters for security reasons. Only one
 * parameter should be passed (otherwise, the function will throw an error)
 * 
 * @param newDetails The information to update in the database
 * @param locationId The unique ID of the location to update
 * @param listId Security parameter to prevent listId/locationId mismatch
 * on shared lists and block unauthorized updates (optional)
 * @param userId Security parameter to prevent userId/locationId mismatch
 * on personal lists and block unauthorized updates (optional)
 * @returns The updated location
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const updateLocation = async (newDetails: LocationUpdateArgs, locationId: number, listId?: number, userId?: number) => {
    // Throw an error if both listId and userId are defined (impossible)
    if (listId && userId) {
        throw new Error("Cannot have both listId and userId defined")
    }
    
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
    
    values.push(locationId, listId || userId)
    const sqlQuery = `
        UPDATE locations
        SET ${fields.join(", ")}
        WHERE id = $${index}
        ${listId ? ` AND list_id = $${index + 1}` : ''}
        ${userId ? ` AND user_id = $${index + 1}` : ' '}
        RETURNING *
    `

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

/**
 * Delete a location from a shared/personal list.
 * 
 * This function includes two optional parameters for security reasons. Only one
 * parameter should be passed (otherwise, the function will throw an error)
 * 
 * @param locationId The unique ID of the location to delete
 * @param listId Security parameter to prevent listId/locationId mismatch
 * on shared lists and block unauthorized updates (optional)
 * @param userId Security parameter to prevent userId/locationId mismatch
 * on personal lists and block unauthorized updates (optional)
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const deleteLocation = async (locationId: number, listId?: number, userId?: number) => {
    // Throw an error if both listId and userId are defined (impossible)
    if (listId && userId) {
        throw new Error("Cannot have both listId and userId defined")
    }
    
    try {
        const result = await pool.query(
            `
                DELETE FROM locations
                WHERE id = $1
                ${listId ? ` AND list_id = $2` : ''}
                ${userId ? ` AND user_id = $2` : ''}
            `, [locationId, listId || userId]
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

/**
 * Add one photo to the database (the "index")
 * 
 * @param locationId The unique ID of the location linked to the photo
 * @param imageId The unique UUID (name) of the photo
 * @throws DatabaseException (500, Internal server error)
 */
export const addPhotoToIndex = async (locationId: number, imageId: string) => {
    try {
        await pool.query(
            "INSERT INTO gallery (id, location_id) VALUES ($1, $2)",
            [imageId, locationId]
        )
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Deletes one photo from the database (the "index")
 * 
 * @param imageId The unique UUID (name) of the photo to delete
 * @param locationId The location linked to the photo (used to prevent
 * unauthorized deletions due to imageId/locationId mismatch)
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const deletePhoto = async (imageId: string, locationId: number) => {
    try {
        // Remove from the index
        const result = await pool.query(
            "DELETE FROM gallery WHERE id = $1 AND location_id = $2",
            [imageId, locationId]
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

/**
 * Counts the number of photos saved in the index for a given location
 * 
 * @param locationId The unique ID of the location
 * @returns The number of saved photos in the index
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const countPhotos = async (locationId: number) => {
    try {
        const result = await pool.query(
            "SELECT COUNT(*)::integer FROM gallery WHERE location_id = $1",
            [locationId]
        )

        if (!result.rows[0]) {
            throw new NotFoundException("Location")
        }

        return result.rows[0].count
    } catch (error) {
        throw new DatabaseException(error as Error)
    }
}

/**
 * Function to manually check and prevent ID mismatch that could lead to faulty
 * permission checks and unauthorized uploads/deletions of gallery images.
 * 
 * Exactly one optional parameter must be passed for the function to execute properly,
 * otherwise, it will throw an error if there's either none/both parameters defined.
 * 
 * A failed verification (ID mismatch of non existent location) will throw a
 * NotFoundException
 * 
 * @param locationId The unique ID of the location
 * @param listId The unique ID of the list that must match the location, if checking
 * against a shared list (optional)
 * @param userId The unique ID of the user that must match the location, if checking
 * against a personal list (optional)
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const verifyIdMatch = async (locationId: number, listId?: number, userId?: number) => {
    // Throw an error if both listId and userId are defined (impossible)
    if (listId && userId) {
        throw new Error("Cannot have both listId and userId defined")
    }

    // Throw an error if no secondary ID has been given
    if (!listId && !userId) {
        throw new Error("A listId or userId is required for verification")
    }
    
    try {
        const result = await pool.query(
            `
                SELECT id
                FROM locations
                WHERE id = $1
                ${listId ? ` AND list_id = $2` : ''}
                ${userId ? ` AND user_id = $2` : ''}
            `, [locationId, listId || userId]
        )

        if (!result.rows[0]) {
            throw new NotFoundException("Location")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}