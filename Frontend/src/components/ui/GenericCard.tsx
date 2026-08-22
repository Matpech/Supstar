import type { ReactNode } from "react"

interface Props {
    children: ReactNode
}

function GenericCard({ children }: Props) {
    return (
        <div className="border-2 rounded-2xl p-4">
            {children}
        </div>
    )
}

export default GenericCard