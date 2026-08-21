import { useEffect, useState } from "react";
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

        const response = await request(`/users/${userId}/locations`)
        if (response.code !== 200) {
            toast.error(`Failed to fetch locations from this user's list (${response.json.error})`)
            setLoading(false)
            return
        }

        setLocations(response.json.results)
        setLoading(false)
    }

    // Initial search
    useEffect(() => {
        search()
    }, [])

    return {
        locations,
        loading,
        search
    }
}