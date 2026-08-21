import { createContext, useCallback, useState, type ReactNode } from "react";
import type { User } from "../types/user";

interface AuthContextType {
    user: User | null
    sessionId: string | null
    jwt: string | null
    login: (
        userData: User,
        sessionId: string,
        token: string
    ) => void
    logout: () => void
    refreshJwt: (token: string) => void
}

interface Props {
    children: ReactNode
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("supstar_user")

        if (!storedUser) {
            return null
        }

        try {
            return JSON.parse(storedUser) as User
        } catch {
            localStorage.removeItem("supstar_user")
            localStorage.removeItem("supstar_jwt")
            localStorage.removeItem("supstar_sessionId")
            return null
        }
    })

    const [sessionId, setSessionId] = useState<string | null>(() => {
        return localStorage.getItem("supstar_sessionId")
    })

    const [jwt, setJwt] = useState<string | null>(() => {
        return localStorage.getItem("supstar_jwt")
    })

    const login = useCallback((userData: User, sessionId: string, token: string) => {
      setUser(userData)
      setSessionId(sessionId)
      setJwt(token)

      localStorage.setItem("supstar_user", JSON.stringify(userData))
      localStorage.setItem("supstar_sessionId", sessionId)
      localStorage.setItem("supstar_jwt", token)
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setSessionId(null)
        setJwt(null)

        localStorage.removeItem("supstar_user")
        localStorage.removeItem("supstar_sessionId")
        localStorage.removeItem("supstar_jwt")
    }, [])

    const refreshJwt = useCallback((token: string) => {
        setJwt(token)
        localStorage.setItem("supstar_jwt", token)
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                sessionId,
                jwt,
                refreshJwt,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}