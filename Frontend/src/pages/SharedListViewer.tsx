import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ListProvider } from "../contexts/ListContext";
import MapView from "../components/MapView";
import ListPanel from "../components/ListPanel";

function SharedListViewer() {
    const navigate = useNavigate()
    const { list_id } = useParams()

    useEffect(() => {
        const listId = parseInt(list_id as string)
        if (Number.isNaN(listId) || listId <= 0) {
            toast.error("Invalid shared list ID")
            navigate("/")
            return
        }
    }, [])

    return (
        <div>
            <ListProvider listType="shared">
                <MapView />
                <ListPanel />
            </ListProvider>
        </div>
    )
}

export default SharedListViewer