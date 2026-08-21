import { useState } from "react"
import ListSearchMenu from "./ListSearchMenu"
import type { Location, SearchFilters, SortOptions } from "../types/location"

interface Props {
    onUpdateQuery: (query: string, filters: SearchFilters, sort: SortOptions) => void,
    onLocationClicked: (location: Location) => void
    locations: Location[]
}

function ListPanel(props: Props) {
    const [menu, setMenu] = useState<'search' | 'details'>('search')

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
            {/* TODO: Switch to the details menu when location is clicked */}
            {menu === 'search' ? (
                <ListSearchMenu
                    onUpdateQuery={props.onUpdateQuery}
                    onLocationClicked={props.onLocationClicked}
                    searchResults={props.locations}
                />
            ) : (
                <></>
            )}
        </aside>
    )
}

export default ListPanel