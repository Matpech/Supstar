import { ApiException } from "../types/errors"
import type { Location } from "../types/locations"
import { locationImportSchema } from "./validation/schemas/locationSchemas"

/**
 * Sanitize JSON data from the location import feature.
 * 
 * 1. Remove invalid fields (fields added by the location export feature)
 * and null fields
 * 2. Validate data through Joi
 * 3. Add the list_id or user_id to tell the database in which place to
 * import the locations
 * 
 * @param locations JSON input data to process and validate
 * @param listId ID of Shared List in which to insert the locations
 * @param userId ID of Personal List in which to insert the locations
 * @returns Sanitized array of locations
 * @throws Error of ApiException (400 INVALID_IMPORT_FILE)
 */
export const sanitizeImportedData = (locations: any[], listId?: number, userId?: number) => {
    // Require exactly one ID (list/user)
    if (listId && userId) {
        throw new Error("Cannot have both listId and userId as search parameters")
    }

    if (!listId && !userId) {
        throw new Error("At least one list/user ID is required")
    }
    
    // First pass : remove invalid fields
    const firstPass = locations.map(entry => {
        // Export specific fields
        delete entry.average_rating
        delete entry.reviews

        // Null fields that would mess with second pass
        if (entry.opening_times == null) {
            delete entry.opening_times
        }
        if (entry.tags == null) {
            delete entry.tags
        }

        // Return cleaned object
        return entry
    })

    // Second pass : input validation through Joi
    const secondPass = locationImportSchema.validate(firstPass)
    if (secondPass.error) {
        throw new ApiException(400, "INVALID_IMPORT_FILE", secondPass.error.message)
    }

    // Third pass : add the proper ID to the locations
    const thirdPass = secondPass.value.map((entry: Location) => {
        if (listId) {
            entry.list_id = listId
        }

        if (userId) {
            entry.user_id = userId
        }

        return entry
    })

    // Value is safe to import
    return thirdPass
}