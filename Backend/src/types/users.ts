export interface UserRegistration {
    username: string
    email: string
    password?: string
    discord_id?: string
}

export interface User {
    id: number
    username: string
    email: string
    discord_id?: string
}
