import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"

const BASE_URL = "/api"

export function useApiClient() {
    const authContext = useContext(AuthContext)
    const navigate = useNavigate()

    if (!authContext) {
        throw new Error("useApiClient must be used inside AuthProvider")
    }

    async function tryJwtRefresh() {
        if (!authContext) {
            throw new Error("useApiClient must be used inside AuthProvider")
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ sessionId: authContext.sessionId })
            })

            if (response.status === 200) {
                const data = await response.json()
                if (data.token) {
                    authContext.refreshJwt(data.token)
                    return data.token
                }
            }

            authContext.logout()
            navigate("/login")
            return null
        } catch (error) {
            authContext.logout()
            navigate("/login")
            return null
        }
    }

    async function request(endpoint: string, options: RequestInit = {}) {
        if (!authContext) {
            throw new Error("useApiClient must be used inside AuthProvider")
        }

        const url = `${BASE_URL}${endpoint}`
        const headers: any = {...options.headers}

        if (options.body && !(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json"
        }

        const jwt = localStorage.getItem("supstar_jwt")

        if (jwt) {
            headers["Authorization"] = `Bearer ${jwt}`
        }

        let response = await fetch(url, {
            ...options,
            headers
        })

        let json = response.status !== 204
            ? await response.json()
            : undefined

        // Check for JWT related errors
        if (response.status === 401) {
            if (json.error === "INVALID_TOKEN") {
                const newJwt = await tryJwtRefresh()
                if (newJwt) {
                    headers["Authorization"] = `Bearer ${newJwt}`
                    response = await fetch(url, {
                        ...options,
                        headers
                    })
                    json = await response.json()
                } else {
                    return {
                        code: 401,
                        json
                    }
                }
            }
        }

        return {
            code: response.status,
            json
        }
    }

    async function rawFetch(endpoint: string, options: RequestInit = {}) {
        if (!authContext) {
            throw new Error("useApiClient must be used inside AuthProvider")
        }

        const url = `${BASE_URL}${endpoint}`
        const headers: any = {...options.headers}

        if (options.body && !(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json"
        }

        const jwt = localStorage.getItem("supstar_jwt")

        if (jwt) {
            headers["Authorization"] = `Bearer ${jwt}`
        }

        let response = await fetch(url, {
            ...options,
            headers
        })

        return response
    }

    return { request, rawFetch }
}