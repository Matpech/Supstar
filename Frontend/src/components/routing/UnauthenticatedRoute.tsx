import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

function UnauthenticatedRoute() {
    const { ctx } = useAuth()

    if (ctx.user) {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}

export default UnauthenticatedRoute