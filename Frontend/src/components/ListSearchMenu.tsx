import { useState } from "react"
import type { Location, SearchFilters, SortOptions } from "../types/location"
import GenericButton from "./ui/GenericButton"
import LocationCard from "./ui/LocationCard"

interface Props {
    onUpdateQuery: (query: string, filters: SearchFilters, sort: SortOptions) => void
    onLocationClicked: (location: Location) => void
    searchResults: Location[]
}

function ListSearchMenu(props: Props) {
    const [query, setQuery] = useState("")
    const [sortBy, setSortBy] = useState<SortOptions>({
        sortBy: 'name',
        order: 'asc'
    })
    const [filters, setFilters] = useState<SearchFilters>({})

    return (
        <div className="flex flex-col gap-4">
            {/* Search section (searchbar, filters, sort) */}
            <section>
                <input
                    type="text"
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search"
                    className="
                        w-full rounded-lg border border-gray-300
                        bg-white px-4 py-3 mr-2 text-sm text-gray-900
                        outline-none transition
                        placeholder:text-gray-400
                        focus:border-black
                    "
                />

                <div className="flex mt-1">
                    <select
                        className="
                            w-full rounded-lg border border-gray-300
                            bg-white px-4 py-3 mr-2 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            focus:border-black
                        "
                    >
                        <option value={"{sortBy: 'name', order: 'asc'}"}>A-Z</option>
                        <option value={"{sortBy: 'name', order: 'desc'}"}>Z-A</option>
                        <option value={"{sortBy: 'price', order: 'asc'}"}>Price (cheap)</option>
                        <option value={"{sortBy: 'pice', order: 'desc'}"}>Price (expensive)</option>
                        <option value={"{sortBy: 'average_rating', order: 'asc'}"}>Rating (worst)</option>
                        <option value={"{sortBy: 'average_rating', order: 'desc'}"}>Rating (best)</option>
                    </select>

                    <GenericButton
                        type="neutral"
                        action={() => {}}
                        classNameOverride="border"
                    >
                        Filters
                    </GenericButton>
                </div>
            </section>

            {/* Container for search results */}
            <div className="flex flex-col gap-1 overflow-y-auto">
                {props.searchResults.map((result) => (
                    <LocationCard data={result} onClick={() => props.onLocationClicked(result)} /> 
                ))}
            </div>

            {/* Actions available */}
            <div>

            </div>
        </div>
    )
}

export default ListSearchMenu