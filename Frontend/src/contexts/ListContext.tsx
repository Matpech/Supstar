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
    listType: 'personal' | 'shared'

    // Callable functions
    search: (
        query: string,
        filters: SearchFilters,
        sort: SortOptions
    ) => void
    setSubmenu: (submenu: 'search' | 'details') => void
    openLocation: (location: Location) => void
    resetFocusPoint: () => void
    createLocation: (data: Location) => Promise<Location>
    updateLocation: (data: Location) => Promise<Location>
    deleteLocation: (data: Location) => Promise<boolean>
}

interface Props {
    children: ReactNode
    listType: 'personal' | 'shared'
}

export const ListContext = createContext<ListContextType | undefined>(undefined)

export function ListProvider({ children, listType }: Props) {
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

    const createLocation = useCallback(async (data: Location) => {
        const newLocation = await pl.create(data)
        return newLocation
    }, [])

    const updateLocation = useCallback(async (data: Location) => {
        const updatedLocation = await pl.update(data)
        return updatedLocation
    }, [])

    const deleteLocation = useCallback(async (data: Location) => {
        const success = await pl.deleteLocation(data)
        return success
    }, [])
    
    return (
        <ListContext.Provider
            value={{
                locations: pl.locations,
                selectedLocation,
                submenu: menu,
                focusAt,
                listType,

                search,
                setSubmenu,
                openLocation,
                resetFocusPoint,
                createLocation,
                updateLocation,
                deleteLocation
            }}
        >
            {children}
        </ListContext.Provider>
    )
}