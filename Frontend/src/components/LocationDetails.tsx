import { useContext, useEffect, useMemo, useState } from "react"
import GenericButton from "./ui/GenericButton"
import { ListContext } from "../contexts/ListContext"
import { Banknote, ChevronLeft, Clock, ImageOff, Map, Pencil, Pin, PinOff, Star, StarCheck, StarX, Tag, Trash2 } from "lucide-react"
import type { Location, ReviewBody } from "../types/location"
import { countryCodes, type CountryCode } from "../utils/iso3166"
import GenericCard from "./ui/GenericCard"
import { createPortal } from "react-dom"
import ImageViewer from "./ImageViewer"
import ModalCard from "./ui/ModalCard"
import ReviewEditor from "./modals/ReviewEditor"
import { useAuth } from "../hooks/useAuth"
import ConfirmationPrompt from "./ui/ConfirmationPrompt"
import PhotoUploadModal from "./modals/PhotoUploadModal"
import toast from "react-hot-toast"

function LocationDetails() {
    const [tab, setTab] = useState<'details' | 'reviews' | 'photos'>('details')
    const [details, setDetails] = useState<Location | null>(null)
    const [openedImage, setOpenedImage] = useState<string | null>(null)
    const [reviewCreateModalOpen, setReviewCreateModalOpen] = useState(false)
    const [reviewEditModalId, setReviewEditModalId] = useState(-1)
    const [reviewDeleteModalId, setReviewDeleteModalId] = useState(-1)
    const [photoUploadModalOpen, setPhotoUploadModalOpen] = useState(false)

    const { ctx } = useAuth()
    const listCtx = useContext(ListContext)
    if (!listCtx) {
        throw new Error("LocationDetails must be used inside ListProvider")
    }

    if (!listCtx.selectedLocation) return

    useEffect(() => {
        async function fetchLocation() {
            if (!listCtx || !listCtx.selectedLocation) return
            const data = await listCtx.getOneLocation(listCtx.selectedLocation.id)
            setDetails(data)
        }

        fetchLocation()
    }, [listCtx.selectedLocation])

    const reviewAlreadyPublished = useMemo(() => {
        if (!details || !details.reviews) return false
        return details.reviews.some((review) => review.reviewer.id === ctx.user?.id)
    }, [details?.reviews])

    const photoLimitReached = useMemo(() => {
        if (!details || !details.images) return false
        return details.images.length >= 10
    }, [details?.images])

    if (!details) return

    // Send the review to the backend and display it on the page
    async function handleReviewSubmission(rating: number, comment: string) {
        if (!listCtx || !listCtx.selectedLocation) return

        const payload: ReviewBody = { rating }

        if (comment.trim().length > 0) {
            payload.comment = comment
        }

        const review = await listCtx.publishReview(listCtx.selectedLocation.id, payload)
        if (review) {
            setDetails((prev) => {
                if (!prev) return null
    
                const newArray = prev?.reviews
                    ? [...prev.reviews, review]
                    : [review]
    
                return {
                    ...prev,
                    reviews: newArray
                }
            })
        }
    }

    async function handleReviewEdition(id: number, rating: number, comment: string) {
        if (!listCtx || !listCtx.selectedLocation) return

        const payload: ReviewBody = { rating }

        if (comment.trim().length > 0) {
            payload.comment = comment
        }

        listCtx.updateReview(listCtx.selectedLocation.id, id, payload)
    }

    async function handleReviewDelete(id: number) {
        if (!listCtx || !listCtx.selectedLocation) return

        const deleted = await listCtx.deleteReview(listCtx.selectedLocation.id, id)
        if (deleted) {
            setDetails((prev) => {
                if (!prev) return null
    
                const newArray = prev?.reviews
                    ? [...prev.reviews].filter((r) => r.id !== id)
                    : []
    
                return {
                    ...prev,
                    reviews: newArray
                }
            })
        }
    }

    async function handlePhotoUpload(files: File[]) {
        if (!listCtx || !listCtx.selectedLocation) return
        toast("Uploading photos...")
        setPhotoUploadModalOpen(false)
        await listCtx.uploadPhotos(listCtx.selectedLocation.id, files)
        listCtx.reloadLocation()
    }

    async function handlePhotoDelete(imageId: string) {
        if (!listCtx || !listCtx.selectedLocation) return
        const success = await listCtx.deletePhoto(listCtx.selectedLocation.id, imageId)
        if (success) {
            setDetails((prev) => {
                if (!prev) return null

                const newGallery = prev.images
                    ? [...prev.images].filter((img) => img !== imageId)
                    : []

                return {
                    ...prev,
                    images: newGallery
                }
            })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex gap-2 items-center">
                <GenericButton
                    type="primary"
                    action={() => listCtx.setSubmenu('search')}
                >
                    <div className="flex items-center gap-1">
                        <ChevronLeft />
                    </div>
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
                        <p><span className="text-green-600 font-semibold">Price: </span>{details.price}€</p>
                    </div>)}

                    <div className="flex gap-2 items-center">
                        {details.status === 'to_be_visited' && (<PinOff size={48} color="var(--color-green-600)" />)}
                        {details.status === 'visited' && (<Pin size={48} color="var(--color-green-600)" />)}
                        {details.status === 'favorite' && (<Star size={48} color="var(--color-green-600)" />)}
                        <p><span className="text-green-600 font-semibold">Status: </span>{details.status}</p>
                    </div>

                    {details.tags && details.tags.length > 0 && (
                    <div className="flex gap-2 items-center">
                        <Tag size={48} color="var(--color-green-600)" />
                        <p><span className="text-green-600 font-semibold">Tags: </span>{details.tags.join(", ")}</p>
                    </div>
                    )}

                    {details.opening_times && (
                    <div className="flex gap-2">
                        <Clock size={48} color="var(--color-green-600)" />
                        <div>
                            <p><span className="text-green-600 font-semibold">Monday: </span>{details.opening_times.monday
                                ? `${details.opening_times.monday.open} - ${details.opening_times.monday.close}`
                                : "No data"}
                            </p>
                            <p><span className="text-green-600 font-semibold">Tuesday: </span>{details.opening_times.tuesday
                                ? `${details.opening_times.tuesday.open} - ${details.opening_times.tuesday.close}`
                                : "No data"}
                            </p>
                            <p><span className="text-green-600 font-semibold">Wednesday: </span>{details.opening_times.wednesday
                                ? `${details.opening_times.wednesday.open} - ${details.opening_times.wednesday.close}`
                                : "No data"}
                            </p>
                            <p><span className="text-green-600 font-semibold">Thursday: </span>{details.opening_times.thursday
                                ? `${details.opening_times.thursday.open} - ${details.opening_times.thursday.close}`
                                : "No data"}
                            </p>
                            <p><span className="text-green-600 font-semibold">Friday: </span>{details.opening_times.friday
                                ? `${details.opening_times.friday.open} - ${details.opening_times.friday.close}`
                                : "No data"}
                            </p>
                            <p><span className="text-green-600 font-semibold">Saturday: </span>{details.opening_times.saturday
                                ? `${details.opening_times.saturday.open} - ${details.opening_times.saturday.close}`
                                : "No data"}
                            </p>
                            <p><span className="text-green-600 font-semibold">Sunday: </span>{details.opening_times.sunday
                                ? `${details.opening_times.sunday.open} - ${details.opening_times.sunday.close}`
                                : "No data"}
                            </p>
                        </div>
                    </div>)}
                </div>)}

                {/* Tab 2: reviews */}
                {tab === 'reviews' && (
                <div>
                    <div className="flex flex-col gap-4">
                        {details.reviews && details.reviews.length > 0 ? (
                            <>
                                <div className="flex gap-2 items-center">
                                    <StarCheck size={64} color="var(--color-green-600)" />
                                    <div>
                                        <p className="text-xl font-bold">Average rating: {details.average_rating}/5</p>
                                        <p className="italic text-gray-500">{details.reviews.length} review(s) published</p>
                                    </div>
                                </div>

                                {details.reviews.map(review => (
                                    <GenericCard key={review.id}>
                                        <div className="relative">
                                            {review.reviewer.id === ctx.user?.id && (
                                                <div className="absolute top-2 right-2 flex gap-1 justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setReviewEditModalId(review.id)
                                                        }}
                                                        className="p-1.5 rounded-md text-orange-600 hover:bg-orange-100 transition-colors"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setReviewDeleteModalId(review.id)
                                                        }}
                                                        className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                            <p>{review.reviewer.username} - {review.rating}/5</p>
                                            {review.comment && (<p className="text-gray-500 italic">{review.comment}</p>)}
                                        </div>
                                    </GenericCard>
                                ))}
                            </>
                        ) : (
                            <div className="flex gap-2 items-center">
                                <StarX size={64} color="var(--color-green-600)" />
                                <div>
                                    <p className="text-xl font-bold">No reviews</p>
                                    <p className="italic text-gray-500">This location has no reviews. Share your opinion.</p>
                                </div>
                            </div>
                        )}

                        <GenericButton
                            type="primary"
                            disabled={reviewAlreadyPublished}
                            action={() => setReviewCreateModalOpen(true)}
                            classNameOverride={listCtx.permissions.PUBLISH_REVIEWS ? "w-full" : "hidden"}
                        >
                            Write a review
                        </GenericButton>

                        {reviewCreateModalOpen && createPortal(
                            <ModalCard title="Write a review" onClose={() => setReviewCreateModalOpen(false)}>
                                <ReviewEditor
                                    onSubmit={(_id: number, rating: number, comment: string) => {
                                        setReviewCreateModalOpen(false)
                                        handleReviewSubmission(rating, comment)
                                    }}
                                />
                            </ModalCard>,
                            document.body
                        )}

                        {reviewEditModalId !== -1 && createPortal(
                            <ModalCard title="Edit review" onClose={() => setReviewEditModalId(-1)}>
                                <ReviewEditor
                                    id={reviewEditModalId}
                                    onSubmit={(id: number, rating: number, comment: string) => {
                                        setReviewEditModalId(-1)
                                        handleReviewEdition(id, rating, comment)
                                    }}
                                />
                            </ModalCard>,
                            document.body
                        )}

                        {reviewDeleteModalId !== -1 && createPortal(
                            <ModalCard title="Delete review" onClose={() => setReviewDeleteModalId(-1)}>
                                <ConfirmationPrompt
                                    onCancel={() => setReviewDeleteModalId(-1)}
                                    onConfirm={() => {
                                        const reviewId = reviewDeleteModalId
                                        setReviewDeleteModalId(-1)
                                        handleReviewDelete(reviewId)
                                    }}
                                    buttonLabel="Delete"
                                    message="Are you sure you want to delete your review ?"
                                />
                            </ModalCard>,
                            document.body
                        )}
                    </div>
                </div>)}

                {/* Tab 3: photos */}
                {tab === 'photos' && (
                <div className="flex flex-col gap-4">
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

                    <GenericButton
                        type="primary"
                        disabled={photoLimitReached}
                        action={() => setPhotoUploadModalOpen(true)}
                        classNameOverride={listCtx.permissions.MANAGE_LOCATIONS ? "w-full" : "hidden"}
                    >
                        Upload photos
                    </GenericButton>
                </div>)}

                {photoUploadModalOpen && createPortal(
                    <ModalCard title="Upload photos" onClose={() => setPhotoUploadModalOpen(false)}>
                        <PhotoUploadModal
                            onCancel={() => setPhotoUploadModalOpen(false)}
                            onUpload={handlePhotoUpload}
                        />
                    </ModalCard>,
                    document.body
                )}

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
                        <ImageViewer
                            allImages={details.images}
                            image={openedImage}
                            setImage={(newImage: string) => setOpenedImage(newImage)}
                            canManage={listCtx.permissions.MANAGE_LOCATIONS}
                            onImageDelete={handlePhotoDelete}
                        />
                    </div>,
                    document.body
                )}
            </div>
        </div>
    )
}

export default LocationDetails