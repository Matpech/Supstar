interface SingleDayOpeningTimes {
    open: string
    close: string
}

export type LocationCategory = 'restaurant' | 'hotel' | 'bar' | 'museum' | 'activity' | 'landmark'
export type LocationStatus = 'to_be_visited' | 'visited' | 'favorite'

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

export interface LocationSearchParams {
    listId?: number
    userId?: number

    query?: string
    categories?: LocationCategory[]
    city?: string
    country?: string
    minimumScore?: number
    prices?: {
        min: number
        max: number
    }
    statuses?: LocationStatus[]
}