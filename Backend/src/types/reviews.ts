export interface ReviewCreateParams {
    location_id: number
    reviewer_id: number
    rating: number
    comment?: string
}

export interface ReviewUpdateParams {
    rating?: number
    comment?: string
}

export interface Review {
    id: number
    reviewer: {
        id: number
        username: string
    }
    rating: number
    comment?: string
}