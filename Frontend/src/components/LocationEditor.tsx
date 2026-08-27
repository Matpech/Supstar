import { useMemo, useState } from "react"
import GenericButton from "./ui/GenericButton"
import type { Location, LocationCategory, LocationStatus } from "../types/location";
import { type CountryCode, countryCodes } from "../utils/iso3166";
import MapSelector from "./MapSelector";
import type { LatLngTuple } from "leaflet";
import toast from "react-hot-toast";

type Day = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"
type OpeningTimesSingleDay = {
    open: string
    close: string
}
type OpeningTimes = Partial<Record<Day, OpeningTimesSingleDay>>
type EnabledDays = Record<Day, boolean>

interface Props {
    initialValue?: Location
    onSubmit: (location: Location) => Promise<void>
}

const categories: { value: LocationCategory; label: string }[] = [
    { value: "restaurant", label: "Restaurant" },
    { value: "hotel", label: "Hotel" },
    { value: "bar", label: "Bar" },
    { value: "museum", label: "Museum" },
    { value: "activity", label: "Activity" },
    { value: "landmark", label: "Landmark" }
]

const statuses: { value: LocationStatus; label: string }[] = [
    { value: "to_be_visited", label: "To be visited" },
    { value: "visited", label: "Visited" },
    { value: "favorite", label: "Favorite" }
]

function LocationEditor({ initialValue, onSubmit }: Props) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState(0)
    const [category, setCategory] = useState<LocationCategory>('restaurant')
    const [status, setStatus] = useState<LocationStatus>('to_be_visited')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState("")
    
    const [address, setAddress] = useState("")
    const [city, setCity] = useState("")
    const [country, setCountry] = useState<CountryCode | undefined>(undefined)
    const [coordinates, setCoordinates] = useState<LatLngTuple | undefined>(undefined)

    const [enabledDays, setEnabledDays] = useState<EnabledDays>({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
    })
    const [openingTimes, setOpeningTimes] = useState<OpeningTimes>({})

    const submitBtnDisabled = useMemo(() => {
        return (
            name.trim() === "" ||
            price < 0 ||
            address.trim() === "" ||
            city.trim() === "" ||
            !coordinates
        )
    }, [name, price, address, city, coordinates])

    function addTag() {
        const trimmed = tagInput.trim()

        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed])
        }

        setTagInput("")
    }

    function removeTag(tagToRemove: string) {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    function handleDayToggle(day: Day, newStatus: boolean) {
        setEnabledDays((current) => ({
            ...current,
            [day]: newStatus
        }))

        const newOpeningTimes: OpeningTimesSingleDay | undefined = newStatus
            ? { open: "00:00", close: "00:00" }
            : undefined

        setOpeningTimes((current) => ({
            ...current,
            [day]: newOpeningTimes
        }))
    }

    function handleTimeChange(day: Day, field: 'open' | 'close', value: string) {
        setOpeningTimes((current) => ({
            ...current,
            [day]: {
                ...(current[day] ?? { open: "", close: "" }),
                [field]: value
            }
        }))
    }

    async function returnLocationObject() {
        // Validate some fields to satisfy Typescript
        // Most of the data is already validated if the submit button was enabled
        if (!country) {
            toast.error("No country selected")
            return
        }

        if (!coordinates) {
            toast.error("Please pin the location on the map")
            return
        }

        // Build a location object and send it through onSubmit
        const location: Location = {
            // ID parameters
            // id -1 is used when creating a new location
            id: initialValue?.id ?? -1,
            user_id: initialValue?.user_id,
            list_id: initialValue?.list_id,

            name,
            category,
            price,
            description: description.trim() !== "" ? description : undefined,
            opening_times: openingTimes,
            tags: tags.length > 0 ? tags : undefined,
            status,

            full_address: address,
            city,
            country_code: country,
            latitude: coordinates[0],
            longitude: coordinates[1]
        }

        await onSubmit(location)
    }

    return (
        <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden">
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                <p className="text-xl font-bold">General information</p>
                
                {/* Name field */}
                <div>
                    <label htmlFor="location-name" className="mb-2 text-md font-bold">
                        Location name
                    </label>

                    <input
                        id="location-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name of the location"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                    />
                </div>

                {/* Description field */}
                <div>
                    <label htmlFor="location-description" className="mb-2 text-md font-bold">
                        Description
                    </label>

                    <input
                        id="location-description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A short description"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                    />
                </div>

                {/* Price, category and status */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label htmlFor="location-price" className="mb-2 text-md font-bold">
                            Price
                        </label>

                        <input
                            id="location-description"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(parseFloat(e.target.value))}
                            placeholder="0€"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label htmlFor="location-category" className="mb-2 text-md font-bold">
                            Category
                        </label>

                        <select
                            id="location-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as LocationCategory)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                        >
                            {categories.map((category) => (
                                <option
                                    key={category.value}
                                    value={category.value}
                                >
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="location-status" className="mb-2 text-md font-bold">
                            Status
                        </label>

                        <select
                            id="location-status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as LocationStatus)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                        >
                            {statuses.map((status) => (
                                <option
                                    key={status.value}
                                    value={status.value}
                                >
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label htmlFor="location-tag" className="mb-2 text-md font-bold">
                        Tags ({tags.length})
                    </label>

                    <input
                        id="location-tag"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault()
                                addTag()
                            }
                        }}
                        placeholder="fast-food, kid-friendly, welcoming..."
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                    />

                    <div>
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                onClick={() => removeTag(tag)}
                                className="mx-0.5 px-3 py-1 bg-green-600 rounded-full text-sm cursor-pointer hover:bg-red-500 duration-200"
                                title="Click to remove"
                            >
                                {tag} ✕
                            </span>
                        ))}
                    </div>
                </div>

                <p className="text-xl font-bold">Geographic details</p>

                {/* Address fields */}
                <div>
                    <label htmlFor="location-address" className="mb-2 text-md font-bold">
                        Full address
                    </label>

                    <input
                        id="location-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. '10 Somewhere Street'"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="location-city" className="mb-2 text-md font-bold">
                            City
                        </label>

                        <input
                            id="location-city"
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Paris"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                        />
                    </div>

                    <div>
                        <label htmlFor="location-country" className="mb-2 text-md font-bold">
                            Country
                        </label>

                        <select
                            id="location-country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value as CountryCode)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                        >
                            {Object.entries(countryCodes).map(([code, name]) => (
                                <option
                                    key={code}
                                    value={code}
                                >
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <p className="text-md font-bold">Coordinates</p>
                    <p className="mb-2 italic text-gray-500">Please put the location on the map below</p>
                    <MapSelector onUpdate={(lat, lon) => setCoordinates([lat, lon])} />
                </div>

                <p className="text-xl font-bold">Opening times <span className="font-medium">(optional)</span></p>

                <div className="grid grid-cols-4 md:grid-cols-7 gap-0.5">
                    {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                        <div key={day}>
                            <input
                                type="checkbox"
                                checked={enabledDays[day as Day]}
                                onChange={(e) => handleDayToggle(day as Day, e.target.checked)}
                                className="mr-1"
                            />
                            <label>{day.slice(0,3)}</label>

                            <input
                                type="text"
                                disabled={!enabledDays[day as Day]}
                                value={openingTimes[day as Day]?.open ?? ""}
                                onChange={(e) => handleTimeChange(day as Day, "open", e.target.value)}
                                placeholder="N/A"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                            />

                            <input
                                type="text"
                                disabled={!enabledDays[day as Day]}
                                value={openingTimes[day as Day]?.close ?? ""}
                                onChange={(e) => handleTimeChange(day as Day, "close", e.target.value)}
                                placeholder="N/A"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4">
                {/* TODO: Add action */}
                <GenericButton
                    type="primary"
                    action={() => returnLocationObject()}
                    disabled={submitBtnDisabled}
                >
                    Submit
                </GenericButton>
            </div>
        </div>
    )
}

export default LocationEditor