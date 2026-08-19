import { ApiError } from "../types/api"
import { useApiClient } from "./useApiClient"

export function useSharedLists() {
    const { request } = useApiClient()

    async function getAvailableSharedLists() {
        const response = await request("/lists")

        if (response.code !== 200) {
            throw new ApiError(response.code, response.json.error, response.json.message)
        }

        return response.json.lists
    }

    return {
        getAvailableSharedLists
    }
}