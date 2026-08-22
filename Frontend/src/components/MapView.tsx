import { useContext, useEffect } from "react"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import { ListContext } from "../contexts/ListContext"
import toast from "react-hot-toast"

const WARN_ACCURACY = 2_500
const NOFLY_ACCURACY = 10_000

function MapController() {
    const map = useMap()
    const listCtx = useContext(ListContext)
    if (!listCtx) {
        // Works for now with the list viewers, but might become
        // problematic once we need to use a map to point at a new
        // location in the creation process
        throw new Error("MapView must be used inside ListProvider")
    }

    // Fly to the coordinates of a selected location
    useEffect(() => {
        if (!listCtx.focusAt) return

        map.flyTo(listCtx.focusAt)
        listCtx.resetFocusPoint()
    }, [listCtx.focusAt])

    // Move the camera to the user's position when loading the map
    useEffect(() => {
        navigator.geolocation.getCurrentPosition((pos) => {
            if (pos.coords.accuracy > NOFLY_ACCURACY) {
                toast("Cannot reliably locate your position")
                return
            } else if (pos.coords.accuracy > WARN_ACCURACY) {
                toast(`Your location may be inaccurate (over ${WARN_ACCURACY}m of inaccuracy)`)
            }

            map.flyTo([
                pos.coords.latitude,
                pos.coords.longitude
            ])
        }, null, { enableHighAccuracy: true })
    }, [])

    return null
}

function MapView() {
    const listCtx = useContext(ListContext)
    if (!listCtx) {
        // Works for now with the list viewers, but might become
        // problematic once we need to use a map to point at a new
        // location in the creation process
        throw new Error("MapView must be used inside ListProvider")
    }

    return (
        <MapContainer
            className="w-full h-full absolute inset-0"
            id="map"
            center={[48.862145, 2.344574]}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController />

            {listCtx.locations.map(l => (
                <Marker key={l.id} position={[l.latitude, l.longitude]}>

                </Marker>
            ))}
        </MapContainer>
    )
}

export default MapView