/**
 * An email address and password pair, used to verify login credentials.
 */
export interface LoginCredentials {
    email: string,
    password: string
}

/**
 * Data stored inside a JWT. This includes the user's ID and username.
 */
export interface UserJWT {
    id: number
    username: string
}
