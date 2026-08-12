export interface UserRegistration {
    username: string
    email: string
    password?: string
    discord_id?: string
}

export interface UserJWT {
    id: number
    username: string
}