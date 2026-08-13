export interface SharedListCreateArgs {
    owner_id: number
    name: string
    description?: string
}

export interface SharedListUpdateArgs {
    name?: string
    description?: string
}