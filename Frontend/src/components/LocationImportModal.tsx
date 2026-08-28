import { useState } from "react"
import GenericButton from "./ui/GenericButton"

interface Props {
    onCancel: Function
    onImport: (file: File) => void
}

function LocationImportModal({ onCancel, onImport }: Props) {
    const [file, setFile] = useState<File | null>(null)

    return (
        <div className="flex flex-col gap-2">
            <p>The import feature supports JSON format only.</p>
            <input
                type="file"
                accept=".json"
                onChange={(e) => {
                    if (!e.target.files) {
                        setFile(null)
                        return
                    }

                    setFile(e.target.files[0])
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
                    disabled={file === null}
                    type="primary"
                    action={() => onImport(file as File)}
                >
                    Import
                </GenericButton>
            </div>
        </div>
    )
}

export default LocationImportModal