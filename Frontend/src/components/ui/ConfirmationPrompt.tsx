import { useEffect, useState } from "react"
import GenericButton from "./GenericButton"

interface Props {
    onConfirm: Function
    onCancel: Function
    delay?: number
    message?: string
    buttonLabel?: string
}

function ConfirmationPrompt({ onConfirm, onCancel, delay, message, buttonLabel }: Props) {
    const [waiting, setWaiting] = useState(true)

    useEffect(() => {
        const id = setTimeout(() => {
            setWaiting(false)
        }, delay || 2000)

        return () => {
            window.clearTimeout(id)
        }
    }, [])
    
    return (
        <div>
            <p>{message || "Are you sure you want to proceed ?"}</p>

            <div className="flex justify-end gap-2">
                <GenericButton
                    type="neutral"
                    action={onCancel}
                >
                    Cancel
                </GenericButton>

                <GenericButton
                    type="danger"
                    disabled={waiting}
                    action={onConfirm}
                >
                    {buttonLabel || "Proceed"}
                </GenericButton>
            </div>
        </div>
    )
}

export default ConfirmationPrompt