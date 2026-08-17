/**
 * Parameters used to create a SL (Shared List) with the `createSharedList`
 * function of the SL repository.
 */
export interface SharedListCreateArgs {
    owner_id: number
    name: string
    description?: string
}

/**
 * Fields of a SL that can be modified by its owner using an update operation.
 */
export interface SharedListUpdateArgs {
    name?: string
    description?: string
}

/**
 * Enum of all roles available to SL (Shared List) members.
 * 
 * From least privileged to most privileged:
 * - READER: Read-Only access to the SL
 * - COMMENTER: Allowed to publish reviews on locations of the SL
 * - EDITOR: Allowed to manage locations (create, update, delete) in the SL
 * - OWNER: Complete control of the SL (change details, manage members and their
 * permissions, deleting the SL). There can only be one OWNER in a SL.
 */
export enum SharedListRoles {
    OWNER = "owner",
    EDITOR = "editor",
    COMMENTER = "commenter",
    READER = "reader"
}