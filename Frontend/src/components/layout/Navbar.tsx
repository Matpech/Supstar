import { BookmarkPlusIcon, LogOut, MapPin, Settings } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { createPortal } from "react-dom"
import ModalCard from "../ui/ModalCard"
import NewListModal from "../modals/NewListModal"
import GenericButton from "../ui/GenericButton"

function Navbar() {
    const auth = useAuth()
    const navigate = useNavigate()
    const [slModalOpen, setSlModalOpen] = useState(false)

    return (
        <div
            className="
                relative z-1000
                flex justify-between
                mx-2 md:mx-4 my-4 py-2 px-2 md:px-16
                border-2 rounded-2xl bg-white
            "
        >
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
                <MapPin size={40} />
                <h1
                    className="text-2xl md:text-4xl font-bold"
                >
                    Supstar
                </h1>
            </div>

            <nav className="flex items-center gap-8">
                <GenericButton
                    type="primary"
                    action={() => setSlModalOpen(true)}
                >
                    <div className="flex items-center gap-1">
                        <BookmarkPlusIcon />
                        <span className="hidden md:block">Create list</span>
                    </div>
                </GenericButton>

                <Link to="/settings" className="md:text-2xl">
                    <Settings className="md:hidden" />
                    <span className="hidden md:block">Settings</span>
                </Link>

                <button
                    onClick={auth.logout}
                    className="md:text-2xl cursor-pointer"
                >
                    <LogOut className="md:hidden" />
                    <span className="hidden md:block">Log out</span>
                </button>
            </nav>

            {slModalOpen && createPortal(
                <ModalCard title="Create shared list" onClose={() => setSlModalOpen(false)}>
                    <NewListModal close={() => setSlModalOpen(false)} />
                </ModalCard>,
                document.body
            )}
        </div>
    )
}

export default Navbar