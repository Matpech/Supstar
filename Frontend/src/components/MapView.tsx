import { useContext, useEffect } from "react"
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import { ListContext } from "../contexts/ListContext"

function MapController() {
    const map = useMap()
    const listCtx = useContext(ListContext)
    if (!listCtx) {
        // Works for now with the list viewers, but might become
        // problematic once we need to use a map to point at a new
        // location in the creation process
        throw new Error("MapView must be used inside ListProvider")
    }

    useEffect(() => {
        if (!listCtx.focusAt) return

        map.flyTo(listCtx.focusAt)
        listCtx.resetFocusPoint()
    }, [listCtx.focusAt])

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