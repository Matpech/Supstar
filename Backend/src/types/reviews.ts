/**
 * Parameters used by the `publishReview` function of the reviews
 * repository to create a review in the database.
 */
export interface ReviewCreateParams {
    location_id: number
    reviewer_id: number
    rating: number
    comment?: string
}

/**
 * Parameters that can be used to update an existing review.
 */
export interface ReviewUpdateParams {
    rating?: number
    comment?: string
}

/**
 * Type definition for a review, in the form that is sent to the
 * user (with details of the reviewer instead of just the UserID)
 */
export interface Review {
    id: number
    reviewer: {
        id: number
        username: string
    }
    rating: number
    comment?: string
}