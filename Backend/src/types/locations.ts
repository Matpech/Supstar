interface SingleDayOpeningTimes {
    open: string
    close: string
}

export type LocationCategory = 'restaurant' | 'hotel' | 'bar' | 'museum' | 'activity' | 'landmark'
export type LocationStatus = 'to_be_visited' | 'visited' | 'favorite'

/**
 * Type definition for locations stored in Shared and Personal Lists.
 * 
 * Can be used to create and return locations.
 */
export interface Location {
    id?: number
    user_id?: number
    list_id?: number

    name: string
    category: LocationCategory
    price?: number
    description?: string
    opening_times?: {
        monday?: SingleDayOpeningTimes
        tuesday?: SingleDayOpeningTimes
        wednesday?: SingleDayOpeningTimes
        thursday?: SingleDayOpeningTimes
        friday?: SingleDayOpeningTimes
        saturday?: SingleDayOpeningTimes
        sunday?: SingleDayOpeningTimes
    },
    tags?: string[]
    status: LocationStatus

    full_address: string
    city: string
    country_code: string
    latitude: number
    longitude: number
}

/**
 * Special variant of the Location interface with all values set as
 * optional for the update operations.
 */
export interface LocationUpdateArgs {
    name?: string
    category?: LocationCategory
    price?: number
    description?: string
    opening_times?: {
        monday?: SingleDayOpeningTimes
        tuesday?: SingleDayOpeningTimes
        wednesday?: SingleDayOpeningTimes
        thursday?: SingleDayOpeningTimes
        friday?: SingleDayOpeningTimes
        saturday?: SingleDayOpeningTimes
        sunday?: SingleDayOpeningTimes
    },
    tags?: string[],
    status?: LocationStatus,

    full_address?: string
    city?: string
    country_code?: string
    latitude?: number
    longitude?: number
}

export enum LocationSortOptions {
    ALPHABETICAL = "name",
    RATING = "average_rating",
    PRICE = "price"
}

/**
 * List of search parameters that can be used to look for locations in
 * the database, including :
 * 
 * - The ID of the list to search (listId for a SL, userId for a PL)
 * - The fields to filter
 * - The sorting options (WIP)
 */
export interface LocationSearchParams {
    listId?: number
    userId?: number

    query?: string
    categories?: LocationCategory[]
    city?: string
    country?: string
    minimumScore?: number
    prices?: {
        min?: number
        max?: number
    }
    statuses?: LocationStatus[]

    sorting?: {
        sort_by: LocationSortOptions
        order: 'asc' | 'desc'
    }
}