import { ApiException, DatabaseException, NotFoundException, ValidationException } from "../types/errors";
import { LocationSortOptions, type Location, type LocationSearchParams, type LocationUpdateArgs } from "../types/locations";
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
                    price,
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
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `,
            [
                data.user_id,
                data.list_id,
                data.name,
                data.category,
                data.price,
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

    if (newDetails.price !== undefined) {
        fields.push(`price = $${index++}`);
        values.push(newDetails.price);
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

/**
 * Search the database for locations that match search parameters. This function
 * allows to search the locations by :
 * - Text search
 * - Category (array)
 * - City (exact)
 * - Country
 * - ~~Minimun score (through reviews)~~ **[WORK IN PROGRESS]**
 * - Price range
 * - Status (array)
 * 
 * @param search The object containing all the search filters
 * @returns An array of matching locations
 * @throws NotFoundException (if no matching location) or DatabaseException (500,
 * Internal server error)
 */
export const getLocations = async (search: LocationSearchParams) => {
    // Require exactly one ID (list/user)
    if (search.listId && search.userId) {
        throw new ValidationException("Cannot have both listId and userId as search parameters")
    }

    if (!search.listId && !search.userId) {
        throw new ValidationException("At least one list/user ID is required")
    }
    
    // Build SQL query dynamically
    const fields = [];
    const values: any[] = [search.listId ?? search.userId];
    let index = 2;

    // Add fields and values in the query depending on defined parameters
    if (search.query !== undefined) {
        fields.push(`(l.name ILIKE '%'||$${index}||'%' OR l.description ILIKE '%'||$${index++}||'%')`)
        values.push(search.query)
    }

    if (search.categories !== undefined && search.categories.length > 0) {
        fields.push(`l.category = ANY($${index++})`)
        values.push(search.categories)
    }

    if (search.city !== undefined) {
        fields.push(`l.city ILIKE $${index++}`)
        values.push(search.city)
    }

    if (search.country !== undefined) {
        fields.push(`l.country_code = $${index++}`)
        values.push(search.country.toUpperCase())
    }

    if (search.minimumScore !== undefined) {
        fields.push(`(SELECT AVG(r.rating) FROM reviews r WHERE r.location_id = l.id) >= $${index++}`)
        values.push(search.minimumScore)
    }

    if (search.prices !== undefined) {
        fields.push(`l.price BETWEEN $${index++} AND $${index++}`)
        values.push(search.prices.min, search.prices.max)
    }

    if (search.statuses !== undefined) {
        fields.push(`l.status = ANY($${index++})`)
        values.push(search.statuses)
    }

    // Handle sorting options
    let sortQuery
    if (search.sorting === undefined) {
        sortQuery = "ORDER BY LOWER(name) DESC"
    } else {
        if (search.sorting.sort_by === LocationSortOptions.ALPHABETICAL) sortQuery = `ORDER BY LOWER(name) ${search.sorting.order.toUpperCase()}`
        else sortQuery = `ORDER BY ${search.sorting.sort_by} ${search.sorting.order.toUpperCase()} NULLS LAST`
    }

    // Assemble the final request string
    const sqlQuery = `
        SELECT l.*, ROUND(AVG(r.rating), 2)::real AS average_rating
        FROM locations l
        LEFT JOIN reviews r ON r.location_id = l.id
        WHERE ${search.listId ? `l.list_id = $1` : `l.user_id = $1`}
        ${fields.length > 0 ? ' AND ' : ''}${fields.join(" AND ")}
        GROUP BY l.id
        ${sortQuery}
    `

    // Executing the SQL query
    try {
        const result = await pool.query(sqlQuery, values)

        return result.rows
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch a single location by ID, enforcing listId/locationId integrity if needed.
 * 
 * @param locationId The unique ID of the location to fetch
 * @param listId The unique ID of the list that includes the location (optional,
 * used for Shared Lists)
 * @param userId The unique ID of the user (optional, used for Personal Lists)
 * @returns The location info
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const getOneLocation = async (locationId: number, listId?: number, userId?: number) => {
    // Throw an error if both listId and userId are defined (impossible)
    if (listId && userId) {
        throw new Error("Cannot have both listId and userId defined")
    }
    
    try {
        const values = [locationId]
        if (listId) {
            values.push(listId)
        }
        if (userId) {
            values.push(userId)
        }

        const result = await pool.query(
            `
                SELECT
                    l.*,
                    (
                        SELECT ROUND(AVG(r.rating), 2)
                        FROM reviews r
                        WHERE r.location_id = l.id
                    )::real AS average_rating,
                    (
                        SELECT ARRAY_AGG(g.id)
                        FROM gallery g
                        WHERE g.location_id = l.id
                    ) AS images
                FROM locations l
                WHERE l.id = $1
                ${listId ? ' AND l.list_id = $2' : ''}
                ${userId ? ' AND l.user_id = $2' : ''}
            `, values
        )

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
 * Export a list of all locations from a Shared/Personal List and
 * their reviews.
 * 
 * @param listId ID of the Shared List to export
 * @param userId ID of the Personal List to export
 * @returns Array of locations with reviews
 * @throws ApiException (404 EXPORT_NO_DATA) or DatabaseException (500
 * Internal server error)
 */
export const exportLocations = async (listId?: number, userId?: number) => {
    // Require exactly one ID (list/user)
    if (listId && userId) {
        throw new ValidationException("Cannot have both listId and userId as search parameters")
    }

    if (!listId && !userId) {
        throw new ValidationException("At least one list/user ID is required")
    }
    
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
                WHERE ${listId ? 'l.list_id' : 'l.user_id'} = $1
                GROUP BY l.id
            `, [listId || userId]
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

/**
 * Bulk import locations into the database from an array of locations.
 * 
 * @param locations The array of locations to insert
 * @returns The number of inserted rows
 * @throws DatabaseException (500 Internal server error)
 */
export const bulkImportLocations = async (locations: Location[]) => {
    if (locations.length === 0) {
        return 0
    }

    const values: any[] = []

    const placeholders = locations.map((location, index) => {
        const offset = index * 14

        values.push(
            location.user_id,
            location.list_id,
            location.name,
            location.category,
            location.price,
            location.description,
            JSON.stringify(location.opening_times),
            JSON.stringify(location.tags),
            location.status,
            location.full_address,
            location.city,
            location.country_code,
            location.latitude,
            location.longitude
        )

        return `(
            $${offset + 1},
            $${offset + 2},
            $${offset + 3},
            $${offset + 4},
            $${offset + 5},
            $${offset + 6},
            $${offset + 7},
            $${offset + 8},
            $${offset + 9},
            $${offset + 10},
            $${offset + 11},
            $${offset + 12},
            $${offset + 13},
            $${offset + 14}
        )`
    })

    try {
        const result = await pool.query(
            `
                INSERT INTO locations
                (
                    user_id,
                    list_id,
                    name,
                    category,
                    price,
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
                VALUES ${placeholders.join(", ")}
            `, values
        )

        return result.rowCount
    } catch (error) {
        throw new DatabaseException(error as Error)
    }

}