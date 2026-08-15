import { ApiException, DatabaseException, NotFoundException } from "../types/errors";
import type { ReviewCreateParams, ReviewUpdateParams } from "../types/reviews";
import { pool } from "../utils/db";

/**
 * Publish a new review for a location
 * 
 * @param data Information required to publish a review
 * @returns The inserted review
 * @throws ApiException (409 INVALID_ID, 409 REVIEW_EXISTS, 422 INVALID_RATING) or
 * DatabaseException (500 Internal server error)
 */
export const publishReview = async (data: ReviewCreateParams) => {
    try {
        const result = await pool.query(
            "INSERT INTO reviews (location_id, reviewer_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *",
            [data.location_id, data.reviewer_id, data.rating, data.comment]
        )

        return result.rows[0]
    } catch (error) {
        if (error instanceof Error && "code" in error && "constraint" in error) {
            switch (error.code) {
                case "23503":
                    throw new ApiException(409, "INVALID_ID", "User or Location ID invalid")
            
                case "23505":
                    throw new ApiException(409, "REVIEW_EXISTS", "You already published a review for this location. Update your existing review instead.")

                case "23514":
                    throw new ApiException(422, "INVALID_RATING", "The rating is invalid")

                default:
                    throw new DatabaseException(error)
            }
        }
    }
}

/**
 * Update an existing review.
 * 
 * @param newData The fields to update in the review
 * @param reviewId The unique ID of the review to update
 * @param userId The unique ID of the user who requested the update (for security)
 * @returns The updated review
 * @throws NotFoundException or DatabaseException (500 Internal server error)
 */
export const updateReview = async (newData: ReviewUpdateParams, reviewId: number, userId: number) => {
    const fields = []
    const values = []
    let index = 1

    if (newData.rating !== undefined) {
        fields.push(`rating = $${index++}`)
        values.push(newData.rating)
    }

    if (newData.comment !== undefined) {
        fields.push(`comment = $${index++}`)
        values.push(newData.comment)
    }

    const sqlQuery = `UPDATE reviews SET ${fields.join(', ')} WHERE id = $${index++} AND reviewer_id = $${index} RETURNING *`
    values.push(reviewId, userId)

    try {
        const result = await pool.query(sqlQuery, values)

        if (!result.rows[0]) {
            throw new NotFoundException("Review")
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
 * Delete a review from the database
 * 
 * @param reviewId The unique ID of the review to delete
 * @param userId The unique ID if the user who requested the deletion (for security)
 * @throws NotFoundException or DatabaseException (500 Internal server error)
 */
export const deleteReview = async (reviewId: number, userId: number) => {
    try {
        const result = await pool.query(
            "DELETE FROM reviews WHERE id = $1 AND reviewer_id = $2",
            [reviewId, userId]
        )

        if (result.rowCount === 0) {
            throw new NotFoundException("Review")
        }
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}

/**
 * Fetch all reviews published for a given location
 * 
 * @param locationId The unique ID of the location
 * @returns An array of reviews
 * @throws ApiException (404 NO_REVIEWS) or DatabaseException (500, Internal
 * server error)
 */
export const getReviewsFromLocation = async (locationId: number) => {
    try {
        const result = await pool.query(
            `
                SELECT
                    r.id,
                    json_build_object('id', u.id, 'username', u.username) AS reviewer,
                    r.rating,
                    r.comment
                FROM reviews r
                INNER JOIN users u ON u.id = r.reviewer_id
                WHERE r.location_id = $1
            `, [locationId]
        )

        if (result.rowCount === 0) {
            throw new ApiException(404, "NO_REVIEWS", "There are no reviews for this location")
        }

        return result.rows
    } catch (error) {
        if (error instanceof ApiException) {
            throw error
        }

        throw new DatabaseException(error as Error)
    }
}