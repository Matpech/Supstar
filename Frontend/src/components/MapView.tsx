import { MapContainer, Marker, TileLayer } from "react-leaflet"
import type { Location } from "../types/location"

interface Props {
    locations: Location[]
}

function MapView(props: Props) {
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

            {props.locations.map(l => (
                <Marker position={[l.latitude, l.longitude]}>

                </Marker>
            ))}
        </MapContainer>
    )
}

export default MapView