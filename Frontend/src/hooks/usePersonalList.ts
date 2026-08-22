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

    return {
        locations,
        loading,
        search,
        fetchOne
    }
}