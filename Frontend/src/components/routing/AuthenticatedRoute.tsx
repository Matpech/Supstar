import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

function AuthenticatedRoute() {
    const { ctx } = useAuth()

    if (!ctx.user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default AuthenticatedRoute