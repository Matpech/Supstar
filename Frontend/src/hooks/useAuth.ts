import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useApiClient } from "./useApiClient";
import { ApiError } from "../types/api";
import { decodeBase64 } from "../utils/base64";

export function useAuth() {
    const context = useContext(AuthContext)
    const { request } = useApiClient()

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider")
    }

    async function login(email: string, password: string) {
        if (!context) {
            throw new Error("useAuth must be used inside AuthProvider")
        }

        // Send a login request using provided credentials
        const response = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        })

        if (response.code !== 200) {
            throw new ApiError(response.code, response.json.error, response.json.message)
        }

        // Decode JWT to extract user data
        const jwtPayload = response.json.token.split(".")[1]
        const userData = JSON.parse(decodeBase64(jwtPayload))
        delete userData.iat
        delete userData.exp

        // Save user data and credentials
        context.login(
            userData,
            response.json.sessionId,
            response.json.token
        )

        return userData
    }

    async function register(email: string, username: string, password: string) {
        if (!context) {
            throw new Error("useAuth must be used inside AuthProvider")
        }

        // Send a registration request
        const response = await request("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, username, password })
        })

        if (response.code !== 200) {
            throw new ApiError(response.code, response.json.code, response.json.message)
        }

        // Decode JWT to extract user data
        const jwtPayload = response.json.token.split(".")[1]
        const userData = JSON.parse(decodeBase64(jwtPayload))
        delete userData.iat
        delete userData.exp

        // Save user data and credentials
        context.login(
            userData,
            response.json.sessionId,
            response.json.token
        )

        return userData
    }

    async function logout() {
        if (!context) {
            throw new Error("useAuth must be used inside AuthProvider")
        }
        
        if (!context.sessionId) return

        // Invalidate session
        const response = await request("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ sessionId: context.sessionId })
        })

        if (response.code !== 204) {
            throw new ApiError(response.code, response.json.code, response.json.message)
        }

        // Delete credentials from the browser
        context.logout()
    }

    return {
        ctx: context,
        login,
        register,
        logout
    }
}