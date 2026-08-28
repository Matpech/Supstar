import { useState } from "react";
import { useApiClient } from "./useApiClient";
import toast from "react-hot-toast";
import type { Location, ReviewBody, SearchFilters, SortOptions } from "../types/location";

export function usePersonalList(userId: number) {
    const { request, rawFetch } = useApiClient()

    const [locations, setLocations] = useState<Location[]>([])
    const [loading, setLoading] = useState(false)

    async function search(params?: {
        query: string
        filters: SearchFilters
        sort: SortOptions
    }) {
        setLoading(true)
        setLocations([])

        const searchParams = params
            ? {
                query: params.query as string|undefined,
                ...params.filters,
                sorting: params.sort
            } : null
        
        if (searchParams && searchParams.query?.trim() === "") {
            delete searchParams.query
        }

        const response = await request(`/users/${userId}/locations/search`, searchParams ? {
            method: "POST",
            body: JSON.stringify(searchParams)
        } : { method: "POST" })
        if (response.code !== 200) {
            toast.error(`Failed to fetch locations from this user's list (${response.json.error})`)
            setLoading(false)
            return
        }

        setLocations(response.json.results)
        setLoading(false)
    }

    async function fetchOne(locationId: number) {
        const response = await request(`/users/${userId}/locations/${locationId}`)

        if (response.code !== 200) {
            toast.error(`Failed to fetch location ${response.json.error}`)
            return
        }

        return response.json
    }

    async function create(data: Location) {
        const payload: any = data
        delete payload.id

        const response = await request(`/users/${userId}/locations`, {
            method: "POST",
            body: JSON.stringify(payload)
        })

        if (response.code !== 201) {
            toast.error(`Failed to create location (${response.json.error})`)
            return
        }

        return response.json
    }

    async function update(data: Location) {
        const locationId = data.id
        const payload: any = data
        delete payload.id
        delete payload.user_id
        delete payload.list_id

        const response = await request(`/users/${userId}/locations/${locationId}`, {
            method: "PATCH",
            body: JSON.stringify(payload)
        })

        if (response.code !== 200) {
            toast.error(`Failed to update location (${response.json.error})`)
            return
        }

        return response.json
    }

    async function deleteLocation(location: Location) {
        const response = await request(`/users/${userId}/locations/${location.id}`, {
            method: "DELETE"
        })

        if (response.code !== 204) {
            toast.error(`Failed to delete location (${response.json.error})`)
            return false
        }

        return true
    }

    async function publishReview(locationId: number, data: ReviewBody) {
        const response = await request(`/users/${userId}/locations/${locationId}/reviews`, {
            method: "POST",
            body: JSON.stringify(data)
        })

        if (response.code !== 201) {
            toast.error(`Failed to submit review (${response.json.error})`)
            return null
        }

        toast.success("Review submitted")
        return response.json
    }

    async function updateReview(locationId: number, reviewId: number, data: ReviewBody) {
        const response = await request(`/users/${userId}/locations/${locationId}/reviews/${reviewId}`, {
            method: "PATCH",
            body: JSON.stringify(data)
        })

        if (response.code !== 200) {
            toast.error(`Failed to edit review (${response.json.error})`)
            return
        }

        toast.success("Review updated")
    }

    async function deleteReview(locationId: number, reviewId: number) {
        const response = await request(`/users/${userId}/locations/${locationId}/reviews/${reviewId}`, {
            method: "DELETE"
        })

        if (response.code !== 204) {
            toast.error(`Failed to delete review (${response.json.error})`)
            return false
        }

        toast.success("Review deleted")
        return true
    }

    async function importLocations(file: File) {
        const data = new FormData()
        data.append("data", file)

        const response = await request("/self/pl-import", {
            method: "POST",
            body: data
        })

        if (response.code !== 200) {
            toast.error(`Failed to import locations (${response.json.error})`)
            return
        }

        toast.success(`${response.json.insertedCount} locations imported`)
    }

    async function exportLocations() {
        const response = await rawFetch("/self/pl-export")
        if (response.status !== 200) {
            toast.error(`Failed to export personal list`)
            return
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `pl-export.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return {
        locations,
        loading,
        search,
        fetchOne,
        create,
        update,
        deleteLocation,
        publishReview,
        updateReview,
        deleteReview,
        importLocations,
        exportLocations
    }
}