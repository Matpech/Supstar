import { useNavigate, useParams } from "react-router-dom"
import ListPanel from "../components/ListPanel"
import MapView from "../components/MapView"
import { usePersonalList } from "../hooks/usePersonalList"
import toast from "react-hot-toast"

function PersonalListViewer() {
    const { user_id } = useParams()
    const navigate = useNavigate()
    
    // Parse and verify user_id parameter
    const userId = parseInt(user_id as string)
    if (Number.isNaN(userId) || userId <= 0) {
        navigate("/")
        toast.error("Invalid user_id")
        return
    }

    const pl = usePersonalList(userId)

    return (
        <div>
            <MapView locations={pl.locations} />
            <ListPanel
                locations={pl.locations}
                onUpdateQuery={(query, filters, sort) => pl.search({query, filters, sort})}
                // TODO: Focus on the location on the MapView
                onLocationClicked={(location) => {console.log(`${location.name} clicked`)}} 
            />
        </div>
    )
}

export default PersonalListViewer