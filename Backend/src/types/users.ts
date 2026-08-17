/**
 * Parameters used to process a user registration.
 * 
 * This interface includes both password and discord_id optional fields so
 * it can be used universally by `createUser` for both the "traditional"
 * email/password authentication and OAuth2 methods.
 */
export interface UserRegistration {
    username: string
    email: string
    password?: string
    discord_id?: string
}

/**
 * Type definition for a user.
 * 
 * Does not include internal and sensitive info (such as password hash).
 */
export interface User {
    id: number
    username: string
    email: string
    discord_id?: string
}
