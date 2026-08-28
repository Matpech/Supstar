export type LocationCategory = 'restaurant' | 'hotel' | 'bar' | 'museum' | 'activity' | 'landmark'
export type LocationStatus = 'to_be_visited' | 'visited' | 'favorite'
interface SingleDayOpeningTimes {
    open: string
    close: string
}

export interface Review {
    id: number
    reviewer: {
        id: number
        username: string
    }
    rating: number
    comment?: string
}

export interface ReviewBody {
    rating: number
    comment?: string
}

export interface Location {
    id: number
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
    average_rating?: number
    images?: string[]
    reviews?: Review[]

    full_address: string
    city: string
    country_code: string
    latitude: number
    longitude: number
}

export interface SortOptions {
    sort_by: 'name' | 'average_rating' | 'price'
    order: 'asc' | 'desc'
}

export interface SearchFilters {
    categories?: LocationCategory[]
    city?: string
    country?: string
    minimumScore?: number
    prices?: {
        min?: number
        max?: number
    }
    statuses?: LocationStatus[]
}