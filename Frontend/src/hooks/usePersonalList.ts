import { useState } from "react";
import { useApiClient } from "./useApiClient";
import toast from "react-hot-toast";
import type { Location, SearchFilters, SortOptions } from "../types/location";

export function usePersonalList(userId: number) {
    const { request } = useApiClient()

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

    return {
        locations,
        loading,
        search,
        fetchOne,
        create,
        update,
        deleteLocation
    }
}