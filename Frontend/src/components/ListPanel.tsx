import { useContext } from "react"
import ListSearchMenu from "./ListSearchMenu"
import { ListContext } from "../contexts/ListContext"
import LocationDetails from "./LocationDetails"

function ListPanel() {
    const listCtx = useContext(ListContext)
    if (!listCtx) {
        throw new Error("ListPanel must be used inside ListProvider")
    }

    return (
        <aside
            className="
                absolute md:relative z-500 p-2
                overflow-y-auto

                inset-x-0 bottom-0
                max-h-[50vh]
                rounded-b-0
                rounded-t-2xl
                border-2
                border-b-0

                md:inset-x-4
                md:min-w-64 md:max-w-96 md:w-1/3
                md:h-[calc(100vh-110px)]
                md:max-h-screen

                md:border-2 md:rounded-2xl bg-white
            "
        >
            {listCtx.submenu === 'search' ? (
                <ListSearchMenu />
            ) : (
                <LocationDetails />
            )}
        </aside>
    )
}

export default ListPanel