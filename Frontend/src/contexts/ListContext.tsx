import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import type { Location, Review, ReviewBody, SearchFilters, SortOptions } from "../types/location";
import type { LatLngExpression } from "leaflet";
import { usePersonalList } from "../hooks/usePersonalList";
import { useParams } from "react-router-dom";
import { SLRoles, type ListPermissions } from "../types/lists";
import { useAuth } from "../hooks/useAuth";
import { useSharedList } from "../hooks/useSharedList";

interface ListContextType {
    // Shared data
    locations: Location[]
    selectedLocation: Location | null
    submenu: 'search' | 'details'
    focusAt: LatLngExpression | null
    listType: 'personal' | 'shared'
    permissions: ListPermissions

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
    uploadPhotos: (locationId: number, photos: File[]) => void
    deletePhoto: (locationId: number, imageId: string) => Promise<boolean>
    publishReview: (locationId: number, data: ReviewBody) => Promise<Review>
    updateReview: (locationId: number, reviewId: number, data: ReviewBody) => void
    deleteReview: (locationId: number, reviewId: number) => Promise<boolean>
    importLocations: (file: File) => Promise<void>
    exportLocations: () => void
}

interface Props {
    children: ReactNode
    listType: 'personal' | 'shared'
}

export const ListContext = createContext<ListContextType | undefined>(undefined)

export function ListProvider({ children, listType }: Props) {
    const { ctx } = useAuth()
    const [menu, setMenu] = useState<'search' | 'details'>('search')
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
    const [focusAt, setFocusAt] = useState<LatLngExpression | null>(null)
    const [permissions, setPermissions] = useState<ListPermissions>({
        MANAGE_LIST: false,
        MANAGE_MEMBERS: false,
        MANAGE_LOCATIONS: false,
        PUBLISH_REVIEWS: false
    })

    let userId: number
    let listId: number
    let pl
    let sl

    // Parse and verify user ID
    if (listType === 'personal') {
        const { user_id } = useParams()
        userId = parseInt(user_id as string)
        if (Number.isNaN(userId) || userId <= 0) {
            return
        }
        pl = usePersonalList(userId)
        sl = undefined
    } else {
        const { list_id } = useParams()
        listId = parseInt(list_id as string)
        if (Number.isNaN(listId) || listId <= 0) {
            return
        }
        sl = useSharedList(listId)
        pl = undefined
    }

    // Throw an error if neither pl/sl is defined
    if (!sl && !pl) {
        throw new Error("Context initialization failed (no pl/sl available)")
    }

    // Define permissions
    // TODO: This version works with PLs, will need to adapt for SLs
    useEffect(() => {
        console.log("Defining permissions...")

        let permissions: ListPermissions = {
            MANAGE_LIST: false,
            MANAGE_MEMBERS: false,
            MANAGE_LOCATIONS: false,
            PUBLISH_REVIEWS: false
        }

        if (listType === 'personal') {
            permissions.MANAGE_LOCATIONS = (userId === ctx.user?.id)
            permissions.PUBLISH_REVIEWS = true
        } else if (listType === 'shared' && sl) {
            permissions.MANAGE_LIST = (sl.details?.role === SLRoles.OWNER)
            permissions.MANAGE_MEMBERS = (sl.details?.role === SLRoles.OWNER)
            permissions.MANAGE_LOCATIONS = (sl.details?.role === SLRoles.OWNER || sl.details?.role === SLRoles.EDITOR)
            permissions.PUBLISH_REVIEWS = (sl.details?.role !== SLRoles.READER)
        }

        setPermissions(permissions)
    }, [sl?.details])

    // Declare the callable functions
    const search = useCallback((query: string, filters: SearchFilters, sort: SortOptions) => {
        if (listType === 'personal' && pl) {
            pl.search({ query, filters, sort })
        } else if (listType === 'shared' && sl) {
            sl.search({ query, filters, sort })
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
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
        if (listType === 'personal' && pl) {
            const newLocation = await pl.create(data)
            return newLocation
        } else if (listType === 'shared' && sl) {
            const newLocation = await sl.createLocation(data)
            return newLocation
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const updateLocation = useCallback(async (data: Location) => {
        if (listType === 'personal' && pl) {
            const updatedLocation = await pl.update(data)
            return updatedLocation
        } else if (listType == 'shared' && sl) {
            const updatedLocation = await sl.updateLocation(data)
            return updatedLocation
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const deleteLocation = useCallback(async (data: Location) => {
        if (listType === 'personal' && pl) {
            const success = await pl.deleteLocation(data)
            return success
        } else if (listType === 'shared' && sl) {
            const success = await sl.deleteLocation(data)
            return success
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const uploadPhotos = useCallback((locationId: number, photos: File[]) => {
        if (listType === 'personal' && pl) {
            pl.uploadPhotosToGallery(locationId, photos)
        } else if (listType === 'shared' && sl) {
            sl.uploadPhotosToGallery(locationId, photos)
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const deletePhoto = useCallback(async (locationId: number, imageId: string) => {
        if (listType === 'personal' && pl) {
            const success = await pl.deletePhotoFromGallery(locationId, imageId)
            return success
        } else if (listType === 'shared' && sl) {
            const success = await sl.deletePhotoFromGallery(locationId, imageId)
            return success
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const publishReview = useCallback(async (locationId: number, data: ReviewBody) => {
        if (listType === 'personal' && pl) {
            const newReview = await pl.publishReview(locationId, data)
            return newReview
        } else if (listType === 'shared' && sl) {
            const newReview = await sl.publishReview(locationId, data)
            return newReview
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const updateReview = useCallback((locationId: number, reviewId: number, data: ReviewBody) => {
        if (listType === 'personal' && pl) {
            pl.updateReview(locationId, reviewId, data)
        } else if (listType === 'shared' && sl) {
            sl.updateReview(locationId, reviewId, data)
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const deleteReview = useCallback(async (locationId: number, reviewId: number) => {
        if (listType === 'personal' && pl) {
            const success = await pl.deleteReview(locationId, reviewId)
            return success
        } else if (listType === 'shared' && sl) {
            const success = await sl.deleteReview(locationId, reviewId)
            return success
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const importLocations = useCallback(async (file: File) => {
        if (listType === 'personal' && pl) {
            await pl.importLocations(file)
        } else if (listType === 'shared' && sl) {
            await sl.importLocations(file)
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])

    const exportLocations = useCallback(() => {
        if (listType === 'personal' && pl) {
            pl.exportLocations()
        } else if (listType === 'shared' && sl) {
            sl.exportLocations()
        } else {
            throw new Error("Cannot perform any of the specialized list actions")
        }
    }, [])
    
    return (
        <ListContext.Provider
            value={{
                locations: pl?.locations || sl?.locations || [],
                selectedLocation,
                submenu: menu,
                focusAt,
                listType,
                permissions,

                search,
                setSubmenu,
                openLocation,
                resetFocusPoint,
                createLocation,
                updateLocation,
                deleteLocation,
                uploadPhotos,
                deletePhoto,
                publishReview,
                updateReview,
                deleteReview,
                importLocations,
                exportLocations
            }}
        >
            {children}
        </ListContext.Provider>
    )
}