import { MoveLeft, MoveRight, Trash2 } from "lucide-react"
import { useEffect } from "react"

interface Props {
    allImages?: string[]
    image: string
    setImage: Function
    canManage?: boolean
    onImageDelete: (imageId: string) => void
}

function ImageViewer({ allImages, image, setImage, canManage, onImageDelete }: Props) {
    function cycleImage(indexChange: number) {
        if (!allImages) return

        let idx = allImages.findIndex((value, _index, _obj) => value === image)

        // Image ID not found in array (should never happen)
        if (idx === -1) return

        // Get new index and cycle back to start/end if needed
        if (idx + indexChange < 0) {
            idx = allImages.length - 1
        } else if (idx + indexChange >= allImages.length) {
            idx = 0
        } else {
            idx = idx + indexChange
        }

        console.log(`New image: ${idx}`)
        setImage(allImages[idx])
    }

    // Switch images with arrow keys
    useEffect(() => {
        function keyEventHandler(e: KeyboardEvent) {
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault()
                    cycleImage(-1)
                    break

                case "ArrowRight":
                    e.preventDefault()
                    cycleImage(1)
                    break
            
                default:
                    break
            }
        }

        window.addEventListener("keydown", keyEventHandler)

        return () => {
            window.removeEventListener("keydown", keyEventHandler)
        }
    }, [image])

    // If the active image gets deleted, go to first
    // If no more images available after delete, close the viewer
    useEffect(() => {
        if (!allImages) return

        if (allImages.length === 0) {
            setImage(null)
            return
        }

        if (!allImages.includes(image)) {
            setImage(allImages[0])
        }
    }, [allImages])

    return (
        <div className="m-auto flex-col gap-2 max-h-[90vh]">
            <div className="flex gap-2 justify-between items-center">
                <MoveLeft className="hidden md:block rounded-[128px] border-4 border-green-600 p-2 bg-gray-100" size={128} color="var(--color-green-600)" onClick={(e) => {
                    e.stopPropagation()
                    cycleImage(-1)
                }} />

                <img
                    className="max-h-[75vh]"
                    src={`/media/photos/${image}.webp`}
                    onClick={(e) => e.stopPropagation()}
                />

                <MoveRight className="hidden md:block rounded-[128px] border-4 border-green-600 p-2 bg-gray-100" size={128} color="var(--color-green-600)" onClick={(e) => {
                    e.stopPropagation()
                    cycleImage(1)
                }} />
            </div>

            <div className="grid grid-cols-5 md:flex md:gap-2 mt-2 mx-auto md:justify-center">
                {allImages?.map(img => (
                    <div className="relative" key={img} onClick={(e) => e.stopPropagation()}>
                        <img
                            className="
                                max-w-16 md:max-w-32
                                aspect-square object-cover
                            "
                            src={`/media/photos/${img}.webp`}
                        />

                        <div
                            className={`absolute inset-0 bg-black/40 opacity-0 ${img === image ? "md:opacity-20": "md:opacity-100"} transition-opacity duration-300 hover:opacity-0`}
                            onClick={() => setImage(img)}
                        />

                        {canManage && (<button
                            className="
                                absolute top-2 right-2 p-1.5
                                rounded-md text-red-600 bg-white hover:bg-red-100 transition-colors
                            "
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onImageDelete(img)
                            }}
                        >
                            <Trash2 size={18} />
                        </button>)}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ImageViewer