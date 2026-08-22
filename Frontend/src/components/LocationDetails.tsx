import { useContext, useEffect, useState } from "react"
import GenericButton from "./ui/GenericButton"
import { ListContext } from "../contexts/ListContext"
import { useParams } from "react-router-dom"
import { usePersonalList } from "../hooks/usePersonalList"
import { Banknote, Clock, ImageOff, Map, Pin, PinOff, Star, StarCheck, StarX, Tag } from "lucide-react"
import type { Location } from "../types/location"
import { countryCodes, type CountryCode } from "../utils/iso3166"
import GenericCard from "./ui/GenericCard"
import { createPortal } from "react-dom"

function LocationDetails() {
    const [tab, setTab] = useState<'details' | 'reviews' | 'photos'>('details')
    const [details, setDetails] = useState<Location | null>(null)
    const [openedImage, setOpenedImage] = useState<string | null>(null)

    const listCtx = useContext(ListContext)
    if (!listCtx) {
        throw new Error("LocationDetails must be used inside ListProvider")
    }

    if (!listCtx.selectedLocation) return

    // Parse and verify user ID
    const { user_id } = useParams()
    const userId = parseInt(user_id as string)
    if (Number.isNaN(userId) || userId <= 0) {
        return
    }
    const pl = usePersonalList(userId)

    useEffect(() => {
        async function fetchLocation() {
            if (!listCtx || !listCtx.selectedLocation) return

            try {
                const data = await pl.fetchOne(listCtx.selectedLocation.id)
                setDetails(data)
            } catch (error) {
                listCtx.setSubmenu('search')
            }
        }

        fetchLocation()
    }, [])

    if (!details) return

    function handleImageClick(imageId: string) {
        setOpenedImage(imageId)
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex gap-2 items-center">
                <GenericButton
                    type="primary"
                    action={() => listCtx.setSubmenu('search')}
                >
                    Back
                </GenericButton>

                <div>
                    <h2 className="text-3xl font-bold">{listCtx.selectedLocation.name}</h2>
                    <p className={listCtx.selectedLocation.description ? "" : "italic text-gray-500"}>
                        {listCtx.selectedLocation.description || "No description provided"}
                    </p>
                </div>
            </div>

            {/* Tab selector */}
            <div className="flex justify-around">
                <button
                    onClick={() => setTab('details')}
                    className={`
                        text-lg font-bold cursor-pointer
                        ${tab === 'details' ? "text-green-600 underline" : "text-black"}
                    `}
                >
                    Details
                </button>

                <button
                    onClick={() => setTab('reviews')}
                    className={`
                        text-lg font-bold cursor-pointer
                        ${tab === 'reviews' ? "text-green-600 underline" : "text-black"}
                    `}
                >
                    Reviews
                </button>

                <button
                    onClick={() => setTab('photos')}
                    className={`
                        text-lg font-bold cursor-pointer
                        ${tab === 'photos' ? "text-green-600 underline" : "text-black"}
                    `}
                >
                    Photos
                </button>
            </div>

            {/* Main content */}
            <div className="overflow-y-auto">
                {/* Tab 1: location details */}
                {tab === 'details' && (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2 items-center">
                        <Map size={48} color="var(--color-green-600)" />
                        <div>
                            <p>{details.full_address}</p>
                            <p>{details.city}, {countryCodes[details.country_code as CountryCode]}</p>
                        </div>
                    </div>

                    {details.price !== undefined && (
                    <div className="flex gap-2 items-center">
                        <Banknote size={48} color="var(--color-green-600)" />
                        <p>Price: {details.price}€</p>
                    </div>)}

                    <div className="flex gap-2 items-center">
                        {details.status === 'to_be_visited' && (<PinOff size={48} color="var(--color-green-600)" />)}
                        {details.status === 'visited' && (<Pin size={48} color="var(--color-green-600)" />)}
                        {details.status === 'favorite' && (<Star size={48} color="var(--color-green-600)" />)}
                        <p>Status: {details.status}</p>
                    </div>

                    {details.tags && details.tags.length > 0 && (
                    <div>
                        <Tag size={48} color="var(--color-green-600)" />
                        <p>Tags: {details.tags.join(", ")}</p>
                    </div>
                    )}

                    {details.opening_times && (
                    <div>
                        <Clock size={48} color="var(--color-green-600)" />
                        <div>
                            <p>Monday: {details.opening_times.monday
                                ? `${details.opening_times.monday.open} - ${details.opening_times.monday.close}`
                                : "No data"}
                            </p>
                            <p>Tuesday: {details.opening_times.tuesday
                                ? `${details.opening_times.tuesday.open} - ${details.opening_times.tuesday.close}`
                                : "No data"}
                            </p>
                            <p>Wednesday: {details.opening_times.wednesday
                                ? `${details.opening_times.wednesday.open} - ${details.opening_times.wednesday.close}`
                                : "No data"}
                            </p>
                            <p>Thursday: {details.opening_times.thursday
                                ? `${details.opening_times.thursday.open} - ${details.opening_times.thursday.close}`
                                : "No data"}
                            </p>
                            <p>Friday: {details.opening_times.friday
                                ? `${details.opening_times.friday.open} - ${details.opening_times.friday.close}`
                                : "No data"}
                            </p>
                            <p>Saturday: {details.opening_times.saturday
                                ? `${details.opening_times.saturday.open} - ${details.opening_times.saturday.close}`
                                : "No data"}
                            </p>
                            <p>Sunday: {details.opening_times.sunday
                                ? `${details.opening_times.sunday.open} - ${details.opening_times.sunday.close}`
                                : "No data"}
                            </p>
                        </div>
                    </div>)}
                </div>)}

                {/* Tab 2: reviews */}
                {tab === 'reviews' && (
                <div>
                    {details.reviews && details.reviews.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2 items-center">
                                <StarCheck size={64} color="var(--color-green-600)" />
                                <div>
                                    <p className="text-xl font-bold">Average rating: {details.average_rating}/5</p>
                                    <p className="italic text-gray-500">{details.reviews.length} review(s) published</p>
                                </div>
                            </div>

                            {details.reviews.map(review => (
                                <GenericCard>
                                    <p>{review.reviewer.username} - {review.rating}/5</p>
                                    {review.comment && (<p className="text-gray-500 italic">{review.comment}</p>)}
                                </GenericCard>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <StarX size={64} color="var(--color-green-600)" />
                            <div>
                                <p className="text-xl font-bold">No reviews</p>
                                <p className="italic text-gray-500">This location has no reviews. Share your opinion.</p>
                            </div>
                        </div>
                    )}
                </div>)}

                {/* Tab 3: photos */}
                {tab === 'photos' && (
                <div>
                    {details.images && details.images.length > 0 ? (
                        <div className="grid grid-cols-2">
                            {details.images.map(img => (
                                <div key={img} className="aspect-square overflow-hidden m-1 shadow-md">
                                    <img
                                        onClick={() => setOpenedImage(img)}
                                        src={`/media/photos/${img}.webp`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <ImageOff size={64} color="var(--color-green-600)" />
                            <div>
                                <p className="text-xl font-bold">No photos found</p>
                                <p className="italic text-gray-500">There are no photos of this location</p>
                            </div>
                        </div>
                    )}
                </div>)}

                {/* Photo view */}
                {openedImage && createPortal(
                    <div
                        onClick={() => setOpenedImage(null)}
                        className={`
                            fixed inset-0 z-1000
                            flex items-center justify-center
                            bg-black/50 backdrop-blur-sm
                        `}
                    >
                        <div className="m-auto">
                            <img
                                src={`/media/photos/${openedImage}.webp`}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    )
}

export default LocationDetails