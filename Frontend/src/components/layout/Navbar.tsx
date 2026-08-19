import { MapPin } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { Link } from "react-router-dom"

function Navbar() {
    const auth = useAuth()

    return (
        <div
            className="
                flex justify-between
                m-4 py-2 px-16
                border-2 rounded-2xl
            "
        >
            <div className="flex items-center gap-2">
                <MapPin size={40} />
                <h1
                    className="text-4xl font-bold"
                >
                    Supstar
                </h1>
            </div>

            <nav className="flex items-center gap-8">
                <Link to="/settings" className="text-2xl">
                    Settings
                </Link>

                <button
                    onClick={auth.logout}
                    className="text-2xl hover:cursor-pointer"
                >
                    Log out
                </button>
            </nav>
        </div>
    )
}

export default Navbar