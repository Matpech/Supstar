import { Star } from "lucide-react"
import { useState } from "react"
import GenericButton from "../ui/GenericButton"
import toast from "react-hot-toast"

interface Props {
    id?: number
    initialRating?: number
    initialComment?: string
    onSubmit: Function
}

function ReviewEditor({ id, initialRating = 0, initialComment = "", onSubmit }: Props) {
    const [rating, setRating] = useState(initialRating)
    const [comment, setComment] = useState(initialComment)
    
    return (
        <div>
            {/* Clickable stars to set rating */}
            <div className="flex items-center">
                <p className="text-xl">Your rating:&nbsp;</p>
                {[1,2,3,4,5].map(star => {
                    const filled = star <= rating
                    return (
                        <Star
                            key={star}
                            fill={filled ? "var(--color-green-600)" : "var(--color-gray-200)"}
                            onClick={() => setRating(star)}
                        />
                    )
                })}
            </div>

            {/* Text field to write a comment */}
            <textarea
                placeholder="What do you have to say about this location ?"
                className="
                    w-full min-h-32 p-1
                    border border-gray-300 focus:border-black rounded-lg
                    outline-none
                    duration-300
                "
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />

            <GenericButton
                type="primary"
                action={() => {
                    if (rating === 0) {
                        toast.error("Please rate this place from 1-5 stars")
                        return
                    }
                    onSubmit(id, rating, comment)
                }}
            >
                Submit
            </GenericButton>
        </div>
    )
}

export default ReviewEditor