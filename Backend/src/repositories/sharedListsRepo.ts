import { ApiException, DatabaseException, NotFoundException, NotImplementedException } from "../types/errors";
import type { SharedListCreateArgs, SharedListUpdateArgs } from "../types/sharedLists";
import { pool } from "../utils/db";

export const createSharedList = async (details: SharedListCreateArgs) => {
    const client = await pool.connect()
    
    try {
        // 1. Start SQL Transaction
        await client.query("BEGIN")

        // 2. Create the shared list
        const result = await client.query(
            "INSERT INTO shared_lists (owner_id, name, description) VALUES ($1, $2, $3) RETURNING id",
            [details.owner_id, details.name, details.description]
        )

        // 3. Add the owner as a list member
        await client.query(
            "INSERT INTO shared_list_members (list_id, user_id, role) VALUES ($1, $2, $3)",
            [result.rows[0].id, details.owner_id, "owner"]
        )

        // 4. Commit and return the new shared list ID to the caller
        await client.query("COMMIT")

        return result.rows[0].id
    } catch (error) {
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

export const getOneSharedList = async (listId: number) => {
    try {
        // 1. Get shared list details
        const resultSL = await pool.query(
            "SELECT * FROM shared_lists WHERE id = $1",
            [listId]
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
            name: resultSL.rows[0].name,
            description: resultSL.rows[0].description,
            members: resultMembers.rows
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

// TODO: Implement function to get all lists available for a user
export const getAvailableSharedLists = async (userId: number) => {
    throw new NotImplementedException()
}

export const checkPermissionToAccessSharedList = async (userId: number, listId: number) => {
    try {
        const result = await pool.query(
            "SELECT * FROM shared_list_members WHERE list_id = $1 AND user_id = $2",
            [listId, userId]
        )

        if (!result.rows[0]) {
            throw new ApiException(403, "SL_ACCESS_DENIED", "You do not have access to this shared list")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}