import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import { SharedListRoles, type SharedListCreateArgs, type SharedListUpdateArgs } from "../types/sharedLists";
import { pool } from "../utils/db";

/**
 * Creates a new Shared List in the database and register its owner.
 * 
 * Uses a SQL transaction to ensure integrity during the two step creation
 * process (creating the list and registering the list member)
 * 
 * @param details Information required to create the list (owner_id, name
 * and description)
 * @returns The inserted Shared List in the database
 * @throws ApiException (409, invalid ID) or DatabaseException (500, Internal
 * server error)
 */
export const createSharedList = async (details: SharedListCreateArgs) => {
    const client = await pool.connect()
    
    try {
        // 1. Start SQL Transaction
        await client.query("BEGIN")

        // 2. Create the shared list
        const result = await client.query(
            "INSERT INTO shared_lists (owner_id, name, description) VALUES ($1, $2, $3) RETURNING *",
            [details.owner_id, details.name, details.description]
        )

        // 3. Add the owner as a list member
        await client.query(
            "INSERT INTO shared_list_members (list_id, user_id, role) VALUES ($1, $2, $3)",
            [result.rows[0].id, details.owner_id, "owner"]
        )

        // 4. Commit and return the new shared list ID to the caller
        await client.query("COMMIT")

        return result.rows[0]
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query("ROLLBACK")

        if (error instanceof Error && "code" in error && "constraint" in error) {
            switch (error.code) {
                case "23503":
                    // Foreign Key violation (owner_id does not exist)
                    throw new ApiException(409, "INVALID_USER_ID", "Your user ID does not exist")
            
                default:
                    throw new DatabaseException(error)
            }
        }
    } finally {
        client.release()
    }
}

/**
 * Update the details of a given Shared List.
 * 
 * @param listId The unique ID of the Shared List to update
 * @param newDetails The fields to update in the Shared List
 * @returns The updated Shared List
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const updateSharedListDetails = async (listId: number, newDetails: SharedListUpdateArgs) => {
    // Build SQL query dynamically
    const fields = [];
    const values = [];
    let index = 1;

    if (newDetails.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(newDetails.name);
    }

    if (newDetails.description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(newDetails.description);
    }

    values.push(listId)
    const sqlQuery = `UPDATE shared_lists SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`
    
    // Execute the query
    try {
        const result = await pool.query(sqlQuery, values)

        if (!result.rows[0]) {
            throw new NotFoundException("Shared list")
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
 * Delete a Shared List.
 * 
 * @param listId The unique ID of the Shared List to delete
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const deleteSharedList = async (listId: number) => {
    try {
        const result = await pool.query(
            "DELETE FROM shared_lists WHERE id = $1",
            [listId]
        )

        if (result.rowCount === 0) {
            throw new NotFoundException("Shared list")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch the details of a single Shared List by ID. Details include :
 * - The name and description of the SL
 * - The list of all members of the SL
 * 
 * @param listId The unique ID of the Shared List
 * @returns The details of the Shared List
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const getOneSharedList = async (listId: number, userId: number) => {
    try {
        // 1. Get shared list details
        const resultSL = await pool.query(
            `
                SELECT
                    sl.*,
                    slm.role
                FROM shared_lists sl
                INNER JOIN shared_list_members slm ON slm.user_id = $2 AND slm.list_id = $1
                WHERE sl.id = $1
            `, [listId, userId]
        )

        if (!resultSL.rows[0]) {
            throw new NotFoundException("Shared list")
        }

        // 2. Get additional members of the list
        const resultMembers = await pool.query(
            `
                SELECT u.id, u.username, m.role
                FROM shared_list_members m
                INNER JOIN users u ON u.id = m.user_id
                WHERE list_id = $1
            `, [listId]
        )

        // 3. Reorganize and send back to caller
        return {
            list_id: listId,
            name: resultSL.rows[0].name,
            description: resultSL.rows[0].description,
            role: resultSL.rows[0].role,
            members: resultMembers.rows
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch a list of available Shared Lists for a given user
 * 
 * @param userId The user ID requesting the list of Shared Lists
 * @returns An array of Shared Lists available to the user
 * @throws DatabaseException (500 Internal server error)
 */
export const getAvailableSharedLists = async (userId: number) => {
    try {
        const result = await pool.query(
            `
                SELECT m.list_id, sl.name, sl.description
                FROM shared_list_members m
                INNER JOIN shared_lists sl ON sl.id = m.list_id
                WHERE user_id = $1
            `, [userId]
        )

        return result.rows
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Verifies if a user has the specified minimum role required to perform an action
 * on a given list.
 * 
 * Roles available are :
 * - reader (read-only access to the SL)
 * - commenter (can publish reviews on locations in the SL)
 * - editor (can manage locations in the SL)
 * - owner (can manage the SL itself and its members)
 * 
 * If the user does not satisfy the minimum role required, an ApiException with the
 * HTTP status code 403 (Forbidden) is thrown to stop execution of the request
 * 
 * @param userId The user ID that makes the request
 * @param listId The unique ID of the list that is being affected by the user
 * @param roleRequired The minimum role required to perform the action
 * @throws ApiException (403, Forbidden) or DatabaseException (500, Internal server error)
 */
export const checkSharedListPermissions = async (userId: number, listId: number, roleRequired: SharedListRoles) => {
    try {
        const result = await pool.query(
            "SELECT * FROM shared_list_members WHERE list_id = $1 AND user_id = $2",
            [listId, userId]
        )

        // If no row is found, user is not a member
        if (!result.rows[0]) {
            throw new ApiException(403, "SL_ACCESS_DENIED", "You do not have access to this shared list")
        }

        // Verify permissions with the minimum role required
        switch (result.rows[0].role) {
            case "editor":
                if (roleRequired === SharedListRoles.OWNER) {
                    throw new ApiException(403, "SL_ACCESS_DENIED", "You do not have permission to perform this action")
                }
                break;
            
            case "commenter":
                if (roleRequired === SharedListRoles.OWNER || roleRequired === SharedListRoles.EDITOR) {
                    throw new ApiException(403, "SL_ACCESS_DENIED", "You do not have permission to perform this action")
                }
                break;

            case "reader":
                if (roleRequired !== SharedListRoles.READER) {
                    throw new ApiException(403, "SL_ACCESS_DENIED", "You do not have permission to perform this action")
                }
                break;
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Add a new member to a Shared List with a specific role
 * 
 * @param email The email of the user that joins the SL
 * @param listId The unique ID of the SL
 * @param role The role to give to the user upon joining the SL
 * @returns The user ID and username that corresponds to the email
 * @throws ApiException (409, INVALID_ID or ALREADY_MEMBER) or DatabaseException
 * (500, Internal server error)
 */
export const addMemberToList = async (email: string, listId: number, role: SharedListRoles) => {
    try {
        // Convert email to userId
        const result = await pool.query(
            "SELECT id, username FROM users WHERE email = $1",
            [email]
        )

        if (!result.rows[0]) {
            throw new NotFoundException("User")
        }

        await pool.query(
            "INSERT INTO shared_list_members (user_id, list_id, role) VALUES ($1, $2, $3)",
            [result.rows[0].id, listId, role]
        )

        return result.rows[0]
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }
        
        if (error instanceof Error && "code" in error && "constraint" in error) {
            switch (error.code) {
                case "23503":
                    // Foreign Key violation (user_id or list_id does not exist)
                    throw new ApiException(409, "INVALID_ID", "User and/or List ID is invalid")
            
                case "23505":
                    // Duplicate (user_id, list_id) pair found
                    throw new ApiException(409, "ALREADY_MEMBER", "This user is already a member of the shared list")

                default:
                    throw new DatabaseException(error)
            }
        }
    }
}

/**
 * Remove a member from a Shared List
 * 
 * @param userId The unique ID of the user to remove from the SL
 * @param listId The unique ID of the SL
 * @throws ApiException (409, NOT_A_MEMBER) or DatabaseException (500, Internal
 * server error)
 */
export const removeMemberFromList = async (userId: number, listId: number) => {
    try {
        const result = await pool.query(
            "DELETE FROM shared_list_members WHERE user_id = $1 AND list_id = $2",
            [userId, listId]
        )

        if (result.rowCount === 0) {
            throw new ApiException(409, "NOT_A_MEMBER", "This user is not a member of the shared list")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Update the role of a given user.
 * 
 * This function will throw an ApiException if newRole is set to owner. To transfer
 * ownership of a SL, the `transferSLOwnership` function shall be used instead of
 * this one, as it needs to perform multiple update operations.
 * 
 * @param userId The unique ID of the user to update
 * @param listId The unique ID of the SL
 * @param newRole The new role to give to the user ()
 * @throws ApiException (409, ROLE_UPDATE_FAILED or INVALID_ROLE) or DatabaseException
 * (500, Internal server error)
 */
export const changeSLMemberRole = async (userId: number, listId: number, newRole: SharedListRoles) => {
    if (newRole === SharedListRoles.OWNER) {
        throw new ApiException(409, "INVALID_ROLE", "This endpoint cannot be used for ownership transfers")
    }
    
    try {
        const result = await pool.query(
            "UPDATE shared_list_members SET role = $1 WHERE user_id = $2 AND list_id = $3 RETURNING *",
            [newRole, userId, listId]
        )

        if (result.rowCount === 0) {
            throw new ApiException(409, "ROLE_UPDATE_FAILED", "Failed to update role. Is the user a member of the list ?")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Transfer the ownership of a Shared List to another member.
 * 
 * Uses a SQL transaction to ensure integrity during the ownership transfer, due
 * to the multiple operations needed.
 * 
 * The current owner is given the editor role after ownership transfer.
 * 
 * @param oldOwner The user ID of the current owner of the SL
 * @param newOwner The user ID of the new owner of the SL
 * @param listId The unique ID of the SL
 * @throws NotFoundException or DatabaseException (500, Internal server error)
 */
export const transferSLOwnership = async (oldOwner: number, newOwner: number, listId: number) => {
    const client = await pool.connect()

    if (oldOwner == newOwner) {
        throw new ApiException(409, "IDENTICAL_IDS", "The IDs of the old owner and the new owner are identical")
    }
    
    try {
        // Begin a transaction
        await client.query("BEGIN")

        // Demote the old owner to the editor role (in the member list)
        await client.query(
            "UPDATE shared_list_members SET role = $1 WHERE user_id = $2 AND list_id = $3",
            [SharedListRoles.EDITOR, oldOwner, listId]
        )

        // Promote the new owner in the member list
        const resultPromote = await client.query(
            "UPDATE shared_list_members SET role = $1 WHERE user_id = $2 AND list_id = $3",
            [SharedListRoles.OWNER, newOwner, listId]
        )

        // Safeguard to ensure the new owner is a member
        if (resultPromote.rowCount === 0) {
            throw new ApiException(409, "NOT_A_MEMBER", "This user is not a member of the shared list")
        }

        // Update the owner_id in the shared_lists table
        await client.query(
            "UPDATE shared_lists SET owner_id = $1 WHERE id = $2",
            [newOwner, listId]
        )

        // Commit the transaction
        await client.query("COMMIT")
    } catch (error) {
        // Rollback the transaction in case of an error
        await client.query("ROLLBACK")
        
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    } finally {
        client.release()
    }
}