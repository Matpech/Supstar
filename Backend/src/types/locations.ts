interface SingleDayOpeningTimes {
    open: string
    close: string
}

export interface Location {
    id?: number
    user_id?: number
    list_id?: number

    name: string
    category: 'restaurant' | 'hotel' | 'bar' | 'museum' | 'activity' | 'landmark'
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
    status: 'to_be_visited' | 'visited' | 'favorite',

    full_address: string
    city: string
    country_code: string
    latitude: number
    longitude: number
}

export interface LocationUpdateArgs {
    name?: string
    category?: 'restaurant' | 'hotel' | 'bar' | 'museum' | 'activity' | 'landmark'
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
    status?: 'to_be_visited' | 'visited' | 'favorite',

    full_address?: string
    city?: string
    country_code?: string
    latitude?: number
    longitude?: number
}