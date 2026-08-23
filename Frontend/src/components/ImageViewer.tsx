import { MoveLeft, MoveRight } from "lucide-react"

interface Props {
    allImages?: string[]
    image: string
    setImage: Function
}

// TODO: Potential improvement : add arrow buttons to cycle between images in order
function ImageViewer({ allImages, image, setImage }: Props) {
    function cycleImage(indexChange: number) {
        if (!allImages) return

        let idx = allImages.findIndex((value, _index, _obj) => value === image)
        console.log(`Current image: ${idx}`)

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

    return (
        <div className="m-auto flex-col gap-2">
            <div className="flex gap-2 justify-center items-center">
                <MoveLeft className="hidden md:block rounded-[128px] border-4 border-green-600 p-2 bg-gray-100" size={128} color="var(--color-green-600)" onClick={(e) => {
                    e.stopPropagation()
                    cycleImage(-1)
                }} />

                <img
                    src={`/media/photos/${image}.webp`}
                    onClick={(e) => e.stopPropagation()}
                />

                <MoveRight className="hidden md:block rounded-[128px] border-4 border-green-600 p-2 bg-gray-100" size={128} color="var(--color-green-600)" onClick={(e) => {
                    e.stopPropagation()
                    cycleImage(1)
                }} />
            </div>

            <div className="grid grid-cols-5 md:flex md:gap-2 mt-2">
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
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ImageViewer