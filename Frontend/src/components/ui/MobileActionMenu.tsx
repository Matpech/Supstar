import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

interface Props {
    children: ReactNode
}

function MobileActionMenu({ children }: Props) {
    const [open, setOpen] = useState(false)
    const [position, setPosition] = useState({
        top: 0,
        left: 0
    })

    const buttonRef = useRef<HTMLButtonElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    function updatePosition() {
        if (!buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()

        setPosition({
            top: rect.bottom + 4,
            left: rect.right
        })
    }

    useLayoutEffect(() => {
        if (!open) return

        updatePosition()
    }, [open])

    useEffect(() => {
        if (!open) return

        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node

            if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) {
                return
            }

            setOpen(false)
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false)
            }
        }

        function handleScroll() {
            updatePosition()
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)

        window.addEventListener("scroll", handleScroll, true)
        window.addEventListener("resize", handleScroll)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
            window.removeEventListener("scroll", handleScroll, true)
            window.removeEventListener("resize", handleScroll)
        }
    }, [open])

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen(value => !value)}
                className="rounded-md p-2 hover:bg-gray-200"
            >
                ...
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="fixed z-50 min-w-48 rounded-md border border-gray-300 bg-white p-1 shadow-lg"
                        style={{
                            top: position.top,
                            left: position.left,
                            transform: "translateX(-100%)"
                        }}
                    >
                        {children}
                    </div>,
                    document.body
                )}
        </>
    )
}

export default MobileActionMenu