import { CircleX } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

interface Props {
    children: ReactNode
    title: string
    onClose: Function
}

function ModalCard(props: Props) {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => {
            setVisible(true)
        })
    }, [])

    function handleClose() {
        setVisible(false)
        setTimeout(() => {
            props.onClose()
        }, 200)
    }

    return (
        <div
            onClick={handleClose}
            className={`
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/50 backdrop-blur-sm
                transition-opacity duration-200
                ${visible ? "opacity-100" : "opacity-0"}
            `}
        >
            <div
                className="
                    border-2 rounded-4xl p-4 mx-auto
                    w-64 md:min-w-xl md:max-w-2xl
                    h-32 md:h-64
                    bg-white
                "
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xl font-bold">{props.title}</p>
                    <button onClick={handleClose} className="hover:cursor-pointer">
                        <CircleX />
                    </button>
                </div>

                <div className="flex flex-col justify-center">
                    {props.children}
                </div>
            </div>
        </div>
    )
}

export default ModalCard