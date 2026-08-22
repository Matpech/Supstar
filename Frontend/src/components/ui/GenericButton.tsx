import type { ReactNode } from "react"
import type { ButtonType } from "../../types/components"

interface Props {
    children: ReactNode
    type: ButtonType
    action: Function
    disabled?: boolean
    classNameOverride?: string
}

function GenericButton(props: Props) {
    return (
        <button
            onClick={() => props.action()}
            disabled={props.disabled}
            className={`
                px-4 py-3
                rounded-lg text-sm font-semibold
                shadow-sm transition duration-300
                focus:outline-none focus:ring focus:ring-offset-1
                cursor-pointer disabled:cursor-not-allowed

                ${props.type === "primary"
                    ? `
                        text-white
                        bg-green-600 hover:bg-green-700
                        focus:ring-green-500
                        active:bg-green-800
                    `
                    : ""
                }
                ${props.type === "neutral"
                    ? `
                        text-black
                        bg-gray-200 hover:bg-gray-300
                        focus:ring-gray-400
                        active:bg-gray-400
                    `
                    : ""
                }
                ${props.type === "danger"
                    ? `
                        text-white
                        bg-red-600 hover:bg-red-700
                        focus:ring-red-500
                        active:bg-red-800
                    `
                    : ""
                }

                disabled:bg-gray-500
                disabled:hover:bg-gray-600
                disabled:focus:ring-gray-500
                disabled:active:bg-gray-700

                ${props.classNameOverride || ""}
            `}
        >
            {props.children}
        </button>
    )
}

export default GenericButton