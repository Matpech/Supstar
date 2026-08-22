import { createContext, useCallback, useState, type ReactNode } from "react";
import type { Location, SearchFilters, SortOptions } from "../types/location";
import type { LatLngExpression } from "leaflet";
import { usePersonalList } from "../hooks/usePersonalList";
import { useParams } from "react-router-dom";

interface ListContextType {
    // Shared data
    locations: Location[]
    selectedLocation: Location | null
    submenu: 'search' | 'details'
    focusAt: LatLngExpression | null

    // Callable functions
    search: (
        query: string,
        filters: SearchFilters,
        sort: SortOptions
    ) => void
    setSubmenu: (submenu: 'search' | 'details') => void
    openLocation: (location: Location) => void
    resetFocusPoint: () => void
}

interface Props {
    children: ReactNode
}

export const ListContext = createContext<ListContextType | undefined>(undefined)

export function ListProvider({ children }: Props) {
    const [menu, setMenu] = useState<'search' | 'details'>('search')
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [focusAt, setFocusAt] = useState<LatLngExpression | null>(null)

    // Parse and verify user ID
    const { user_id } = useParams()
    const userId = parseInt(user_id as string)
    if (Number.isNaN(userId) || userId <= 0) {
        return
    }
    const pl = usePersonalList(userId)

    // Declare the callable functions
    const search = useCallback((query: string, filters: SearchFilters, sort: SortOptions) => {
        pl.search({ query, filters, sort })
    }, [])

    const setSubmenu = useCallback((submenu: 'search' | 'details') => {
        setMenu(submenu)
    }, [])

    const openLocation = useCallback((location: Location) => {
        setSelectedLocation(location)
        setMenu('details')
        setFocusAt([location.latitude, location.longitude])
    }, [])

    const resetFocusPoint = useCallback(() => {
        setFocusAt(null)
    }, [])
    
    return (
        <ListContext.Provider
            value={{
                locations: pl.locations,
                selectedLocation,
                submenu: menu,
                focusAt,

                search,
                setSubmenu,
                openLocation,
                resetFocusPoint
            }}
        >
            {children}
        </ListContext.Provider>
    )
}