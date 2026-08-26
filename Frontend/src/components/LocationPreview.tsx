import { BedSingle, Beer, Brush, CalendarDays, ChefHat, Landmark } from "lucide-react"
import type { Location } from "../types/location"

interface Props {
    location: Location
    onClick: Function
}

function LocationPreview({ location, onClick }: Props) {
    return (
        <div className="m-2 flex gap-2 max-h-24 items-center" onClick={() => onClick()}>
            {location.category === "restaurant" && <ChefHat size={48} />}
            {location.category === "hotel" && <BedSingle size={48} />}
            {location.category === "bar" && <Beer size={48} />}
            {location.category === "museum" && <Brush size={48} />}
            {location.category === "activity" && <CalendarDays size={48} />}
            {location.category === "landmark" && <Landmark size={48} />}

            <div>
                <p className="font-bold text-xl">{location.name}</p>

                <p className="italic text-gray-500 -mt-4">Click for more details</p>
            </div>
        </div>
    )
}

export default LocationPreview