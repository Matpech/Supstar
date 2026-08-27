import { BedSingle, Beer, Brush, CalendarDays, ChefHat, Landmark, Pencil, Trash2 } from "lucide-react"
import type { Location } from "../../types/location"
import { useState } from "react"
import { createPortal } from "react-dom"
import ModalCard from "./ModalCard"
import ConfirmationPrompt from "./ConfirmationPrompt"
import LocationEditor from "../LocationEditor"

interface Props {
    data: Location
    onClick: Function
    canManage?: boolean
    onEdit: (location: Location) => Promise<boolean>
    onDelete: (location: Location) => void
}

function LocationCard({ data, onClick, canManage, onEdit, onDelete }: Props) {
    const [showDeletePrompt, setShowDeletePrompt] = useState(false)
    const [showUpdateModal, setShowUpdateModal] = useState(false)
    
    async function handleEdit(location: Location) {
        const success = await onEdit(location)
        if (success) {
            setShowUpdateModal(false)
        }
    }

    return (
        <div className="relative border rounded-lg p-2" onClick={() => onClick()}>
            {canManage && (
                <div className="absolute top-2 right-2 flex gap-1 justify-end">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowUpdateModal(true)
                        }}
                        className="p-1.5 rounded-md text-orange-600 hover:bg-orange-100 transition-colors"
                    >
                        <Pencil size={18} />
                    </button>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowDeletePrompt(true)
                        }}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

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

            {showUpdateModal && createPortal(
                <ModalCard title="Edit location" onClose={() => setShowUpdateModal(false)}>
                    <LocationEditor initialValue={data} onSubmit={handleEdit} />
                </ModalCard>,
                document.body
            )}

            {showDeletePrompt && createPortal(
                <ModalCard title="Delete location" onClose={() => setShowDeletePrompt(false)}>
                    <ConfirmationPrompt
                        onCancel={() => setShowDeletePrompt(false)}
                        onConfirm={() => {
                            setShowDeletePrompt(false)
                            onDelete(data)
                        }}
                        buttonLabel="Delete"
                        message="Are you sure you want to delete this location ?"
                    />
                </ModalCard>,
                document.body
            )}
        </div>
    )
}

export default LocationCard