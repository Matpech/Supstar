import { useContext, useEffect, useMemo, useState } from "react"
import type { Location, SearchFilters, SortOptions } from "../types/location"
import GenericButton from "./ui/GenericButton"
import { ListContext } from "../contexts/ListContext"
import LocationCard from "./ui/LocationCard"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
import { createPortal } from "react-dom"
import ModalCard from "./ui/ModalCard"
import SearchFiltersMenu from "./SearchFiltersMenu"
import LocationEditor from "./LocationEditor"
import toast from "react-hot-toast"

function ListSearchMenu() {
    const listCtx = useContext(ListContext)
    if (!listCtx) {
        throw new Error("ListSearchMenu must be used inside ListProvider")
    }

    const [query, setQuery] = useState("")
    const [sort, setSort] = useState<SortOptions>({
        sort_by: 'name',
        order: 'asc'
    })
    const [filters, setFilters] = useState<SearchFilters>({})
    const [filtersModalOpen, setFiltersModalOpen] = useState(false)
    const [locationCreateModalOpen, setLocationCreateModalOpen] = useState(false)
    const searchParams = useMemo(() => ({
        query,
        filters,
        sort
    }), [query, filters, sort])
    const debouncedParams = useDebouncedValue(searchParams)

    useEffect(() => {
        listCtx.search(
            debouncedParams.query,
            debouncedParams.filters,
            debouncedParams.sort
        )
    }, [debouncedParams])

    function handleApplyFilters(filters: any) {
        const processedFilters: SearchFilters = {}

        if (filters.categories.length > 0) processedFilters.categories = filters.categories
        if (filters.statuses.length > 0) processedFilters.statuses = filters.statuses
        if (filters.city.trim() !== "") processedFilters.city = filters.city.trim()
        if (filters.country !== "__") processedFilters.country = filters.country
        if (filters.minimumScore > 0) processedFilters.minimumScore = filters.minimumScore
        if (filters.prices) {
            processedFilters.prices = {}

            if (filters.prices.min) processedFilters.prices.min = filters.prices.min
            if (filters.prices.max) processedFilters.prices.max = filters.prices.max
        }

        setFilters(processedFilters)
    }

    async function handleCreateLocation(location: Location) {
        if (!listCtx) return

        const data = await listCtx.createLocation(location)
        if (data) {
            setLocationCreateModalOpen(false)
            toast.success("Location successfully created")
            listCtx.search(
                debouncedParams.query,
                debouncedParams.filters,
                debouncedParams.sort
            )
        }
    }

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
                        onChange={(e) => setSort(JSON.parse(e.target.value))}
                        className="
                            w-full rounded-lg border border-gray-300
                            bg-white px-4 py-3 mr-2 text-sm text-gray-900
                            outline-none transition
                            placeholder:text-gray-400
                            focus:border-black
                        "
                    >
                        <option value={'{"sort_by": "name", "order": "asc"}'}>A-Z</option>
                        <option value={'{"sort_by": "name", "order": "desc"}'}>Z-A</option>
                        <option value={'{"sort_by": "price", "order": "asc"}'}>Price (cheap)</option>
                        <option value={'{"sort_by": "price", "order": "desc"}'}>Price (expensive)</option>
                        <option value={'{"sort_by": "average_rating", "order": "asc"}'}>Rating (worst)</option>
                        <option value={'{"sort_by": "average_rating", "order": "desc"}'}>Rating (best)</option>
                    </select>

                    <GenericButton
                        type="neutral"
                        action={() => setFiltersModalOpen(true)}
                        classNameOverride="border"
                    >
                        Filters
                    </GenericButton>
                </div>
            </section>

            {/* Container for search results */}
            <div className="flex flex-col gap-1 overflow-y-auto">
                {listCtx.locations.map((result) => (
                    <LocationCard key={result.id} data={result} onClick={() => listCtx.openLocation(result)} /> 
                ))}
            </div>

            {/* TODO: Actions available */}
            <div>
                <GenericButton
                    type="primary"
                    action={() => setLocationCreateModalOpen(true)}
                >
                    New location
                </GenericButton>
            </div>

            {filtersModalOpen && createPortal(
                <ModalCard title="Filters" onClose={() => setFiltersModalOpen(false)}>
                    <SearchFiltersMenu
                        filters={filters}
                        open={filtersModalOpen}
                        onApply={(filters) => {
                            handleApplyFilters(filters)
                            setFiltersModalOpen(false)
                        }}
                        onCancel={() => setFiltersModalOpen(false)}
                    />
                </ModalCard>,
                document.body
            )}

            {locationCreateModalOpen && createPortal(
                <ModalCard title="New location" onClose={() => setLocationCreateModalOpen(false)}>
                    <LocationEditor onSubmit={handleCreateLocation} />
                </ModalCard>,
                document.body
            )}
        </div>
    )
}

export default ListSearchMenu