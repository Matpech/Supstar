export enum SLRoles {
    READER = "reader",
    COMMENTER = "commenter",
    EDITOR = "editor",
    OWNER = "owner"
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

export interface ListPermissions {
    MANAGE_LIST: boolean
    MANAGE_MEMBERS: boolean
    MANAGE_LOCATIONS: boolean
    PUBLISH_REVIEWS: boolean
}