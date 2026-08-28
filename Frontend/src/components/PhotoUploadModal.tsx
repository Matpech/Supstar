import { useState } from "react"
import GenericButton from "./ui/GenericButton"

interface Props {
    onCancel: Function
    onUpload: (files: File[]) => void
}

function PhotoUploadModal({ onCancel, onUpload }: Props) {
    const [files, setFiles] = useState<File[] | null>(null)

    return (
        <div className="flex flex-col gap-2">
            <p>You can attach up to 10 photos to this location.</p>
            <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                    if (!e.target.files) {
                        setFiles(null)
                        return
                    }

                    setFiles(Array.from(e.target.files))
                }}
                className="
                    file:px-4 file:py-3
                    rounded-lg text-sm font-semibold
                    file:shadow-sm transition duration-300
                    focus:outline-none focus:ring focus:ring-offset-1
                    border-2 border-black
                    cursor-pointer
                    file:text-white
                    file:bg-green-600 file:hover:bg-green-700
                    file:focus:ring-green-500
                    file:active:bg-green-800
                "
            />

            <div className="flex gap-2 justify-end">
                <GenericButton
                    type="neutral"
                    action={onCancel}
                >
                    Cancel
                </GenericButton>

                <GenericButton
                    disabled={files === null}
                    type="primary"
                    action={() => onUpload(files as File[])}
                >
                    Upload
                </GenericButton>
            </div>
        </div>
    )
}

export default PhotoUploadModal