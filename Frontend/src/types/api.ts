export interface User {
    id: number
    username: string
}

export interface UserStats {
    personal_locations: number
    reviews_published: number
    average_rating: number
    lists_owned: number
}

export class ApiError extends Error {
    public readonly statusCode: number
    public readonly error: string

    constructor(
        statusCode: number,
        error: string,
        message: string
    ) {
        super(message)
        this.name = "ApiError"
        this.statusCode = statusCode
        this.error = error
    }
}