import { useNavigate, useParams } from "react-router-dom"
import ListPanel from "../components/ListPanel"
import MapView from "../components/MapView"
import { ListProvider } from "../contexts/ListContext"
import toast from "react-hot-toast"
import { useEffect } from "react"

function PersonalListViewer() {
    const navigate = useNavigate()
    const { user_id } = useParams()

    useEffect(() => {
        // Parse and verify user ID
        const userId = parseInt(user_id as string)
        if (Number.isNaN(userId) || userId <= 0) {
            toast.error("Invalid user ID")
            navigate("/")
            return
        }
    }, [])

    return (
        <div>
            <ListProvider>
                <MapView />
                <ListPanel />
            </ListProvider>
        </div>
    )
}

export default PersonalListViewer