import { BedSingle, Beer, Brush, CalendarDays, ChefHat, Landmark } from "lucide-react"
import type { Location } from "../../types/location"

interface Props {
    data: Location
    onClick: Function
}

function LocationCard({ data, onClick }: Props) {
    return (
        <div className="border rounded-lg p-2" onClick={() => onClick()}>
            <div className="flex gap-2 items-center">
                {data.category === "restaurant" && <ChefHat size={64} />}
                {data.category === "hotel" && <BedSingle size={64} />}
                {data.category === "bar" && <Beer size={64} />}
                {data.category === "museum" && <Brush size={64} />}
                {data.category === "activity" && <CalendarDays size={64} />}
                {data.category === "landmark" && <Landmark size={64} />}

                <div>
                    <p className="font-bold text-xl">{data.name}</p>
                    {data.description ? (
                        <p>{data.description}</p>
                    ) : (
                        <p className="italic text-gray-500">No description provided</p>
                    )}

                    {data.average_rating ? (
                        <p className="-mt-1">{data.average_rating} / 5</p>
                    ) : (
                        <p className="-mt-1 italic text-gray-500">No ratings</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LocationCard