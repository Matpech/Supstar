export enum SLRoles {
    READER = "reader",
    COMMENTER = "commenter",
    EDITOR = "editor",
    OWNER = "owner"
}

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

export interface SharedList {
    list_id: number
    name: string
    description?: string
    role?: SLRoles
    members?: {
        id: number
        username: string
        role: SLRoles
    }
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