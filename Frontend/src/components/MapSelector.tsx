import type { LatLngExpression } from "leaflet"
import { useState } from "react"
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet"

interface MapClickHandlerProps {
    onClick: (latitude: number, longitude: number) => void
}

interface MapSelectorProps {
    initialCoords?: LatLngExpression
    onUpdate: (latitude: number, longitude: number) => void
}

function MapClickHandler({ onClick }: MapClickHandlerProps) {
    useMapEvents({
        click(event) {
            onClick(event.latlng.lat, event.latlng.lng)
        }
    })

    return null
}

function MapSelector({ initialCoords, onUpdate }: MapSelectorProps) {
    const [markerPos, setMarkerPos] = useState<LatLngExpression | undefined>(initialCoords)

    return (
        <MapContainer
            className="w-full h-64"
            id="map-selector"
            center={[48.862145, 2.344574]}
            zoom={13}
            scrollWheelZoom={true}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onClick={(lat, lon) => {
                setMarkerPos([lat, lon])
                onUpdate(lat, lon)
            }} />

            {markerPos && (
                <Marker position={markerPos}>
                    
                </Marker>
            )}
        </MapContainer>
    )
}

export default MapSelector