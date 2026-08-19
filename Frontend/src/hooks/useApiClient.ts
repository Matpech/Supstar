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

        if (authContext.jwt) {
            headers["Authorization"] = `Bearer ${authContext.jwt}`
        }

        let response = await fetch(url, {
            ...options,
            headers
        })

        let json

        // Check for JWT related errors
        if (response.status === 401) {
            json = await response.json()
            if (json.code === "INVALID_TOKEN") {
                const newJwt = await tryJwtRefresh()
                if (newJwt) {
                    headers["Authorization"] = `Bearer ${newJwt}`
                    response = await fetch(url, {
                        ...options,
                        headers
                    })
                } else {
                    return {
                        code: 401,
                        json
                    }
                }
            }
        }

        if (response.status !== 204) {
            if (!json) {
                json = await response.json()
            }

            return {
                code: response.status,
                json
            }
        } else {
            return {
                code: response.status
            }
        }
    }

    return { request }
}