import { MapPin } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom"

function Navbar() {
    const auth = useAuth()
    const navigate = useNavigate()

    return (
        <div
            className="
                relative z-1000
                flex justify-between
                mx-2 md:mx-4 my-4 py-2 px-2 md:px-16
                border-2 rounded-2xl bg-white
            "
        >
            <div className="flex items-center gap-2 hover:cursor-pointer" onClick={() => navigate("/")}>
                <MapPin size={40} />
                <h1
                    className="text-2xl md:text-4xl font-bold"
                >
                    Supstar
                </h1>
            </div>

            <nav className="flex items-center gap-8">
                <Link to="/settings" className="md:text-2xl">
                    Settings
                </Link>

                <button
                    onClick={auth.logout}
                    className="md:text-2xl hover:cursor-pointer"
                >
                    Log out
                </button>
            </nav>
        </div>
    )
}

export default Navbar