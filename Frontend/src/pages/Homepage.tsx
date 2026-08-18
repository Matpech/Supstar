import { useAuth } from "../hooks/useAuth"

function Homepage() {
    const auth = useAuth()

    return (
        <div>
            <h2>Welcome, {auth.ctx.user?.username ?? "User"}!</h2>
            <p>What will you discover today ?</p>
        </div>
    )
}

export default Homepage