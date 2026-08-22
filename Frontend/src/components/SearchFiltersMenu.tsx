import { useEffect, useState } from "react";
import type { LocationCategory, LocationStatus, SearchFilters } from "../types/location";
import { countryCodes } from "../utils/iso3166";
import GenericButton from "./ui/GenericButton";

interface FilterModalProps {
    open: boolean
    filters: SearchFilters
    onApply: (filters: Filters) => void
    onCancel: () => void
}

interface Filters {
    categories: LocationCategory[]
    city: string
    country: string
    minimumScore: number
    prices: {
        min: number | null
        max: number | null
    };
    statuses: LocationStatus[]
}

const categories: { value: LocationCategory; label: string }[] = [
    { value: "restaurant", label: "Restaurant" },
    { value: "hotel", label: "Hotel" },
    { value: "bar", label: "Bar" },
    { value: "museum", label: "Museum" },
    { value: "activity", label: "Activity" },
    { value: "landmark", label: "Landmark" }
]

const statuses: { value: LocationStatus; label: string }[] = [
    { value: "to_be_visited", label: "To be visited" },
    { value: "visited", label: "Visited" },
    { value: "favorite", label: "Favorite" }
]

const countries = {
    __: "Any country",
    ...countryCodes
}


function SearchFiltersMenu({
    open,
    filters,
    onApply,
    onCancel
}: FilterModalProps) {
    const [localFilters, setLocalFilters] = useState<Filters>(() => initializeFilters(filters))
    
    function initializeFilters(filters: SearchFilters) {
        const processedFilters: any = {}

        processedFilters.categories = filters.categories || []
        processedFilters.city = filters.city || ""
        processedFilters.country = filters.country || "__"
        processedFilters.minimumScore = filters.minimumScore || 0
        processedFilters.prices = filters.prices || { min: null, max: null }
        processedFilters.statuses = filters.statuses || []

        return processedFilters
    }

    // Reload the currently applied filters into the component's local filters
    useEffect(() => {
        if (open) {
            const processed = initializeFilters(filters)
            setLocalFilters(processed)
        }
    }, [open, filters])

    if (!open) {
        return null
    }

    const toggleCategory = (category: LocationCategory) => {
        setLocalFilters((current) => ({
            ...current,
            categories: current.categories.includes(category)
                ? current.categories.filter((c) => c !== category)
                : [...current.categories, category],
        }))
    }

    const toggleStatus = (status: LocationStatus) => {
        setLocalFilters((current) => ({
            ...current,
            statuses: current.statuses.includes(status)
                ? current.statuses.filter((s) => s !== status)
                : [...current.statuses, status],
        }))
    }

    const updatePrice = (
        field: "min" | "max",
        value: string
    ) => {
        setLocalFilters((current) => ({
            ...current,
            prices: {
                ...current.prices,
                [field]: value === "" ? null : Number(value),
            },
        }))
    }

    const handleCancel = () => {
        onCancel()
    }

    const handleApply = () => {
        onApply(localFilters)
    }

    return (
        <div
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
        >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
                {/* Categories */}
                <fieldset>
                    <legend className="mb-3 text-md font-bold">
                        Categories
                    </legend>

                    <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                            <label
                                key={category.value}
                                className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={localFilters.categories.includes(
                                        category.value
                                    )}
                                    onChange={() =>
                                        toggleCategory(category.value)
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />

                                <span className="text-sm text-gray-700">
                                    {category.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                {/* City */}
                <div>
                    <label
                        htmlFor="filter-city"
                        className="mb-2 block text-md font-bold"
                    >
                        City
                    </label>

                    <input
                        id="filter-city"
                        type="text"
                        value={localFilters.city}
                        onChange={(e) =>
                            setLocalFilters((current) => ({
                                ...current,
                                city: e.target.value
                            }))
                        }
                        placeholder="e.g. Paris"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                    />
                </div>

                {/* Country */}
                <div>
                    <label
                        htmlFor="filter-country"
                        className="mb-2 block text-md font-bold"
                    >
                        Country
                    </label>

                    <select
                        id="filter-country"
                        value={localFilters.country}
                        onChange={(e) =>
                            setLocalFilters((current) => ({
                                ...current,
                                country: e.target.value
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    >
                        {Object.entries(countries).map(([code, name]) => (
                            <option
                                key={code}
                                value={code}
                            >
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Minimum score */}
                <div>
                    <label
                        htmlFor="filter-score"
                        className="mb-2 block text-md font-bold"
                    >
                        Minimum score
                    </label>

                    <select
                        id="filter-score"
                        value={localFilters.minimumScore}
                        onChange={(e) =>
                            setLocalFilters((current) => ({
                                ...current,
                                minimumScore: Number(e.target.value)
                            }))
                        }
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                    >
                        <option value={0}>Any score</option>
                        <option value={1}>1+</option>
                        <option value={2}>2+</option>
                        <option value={3}>3+</option>
                        <option value={4}>4+</option>
                        <option value={5}>5</option>
                    </select>
                </div>

                {/* Price range */}
                <fieldset>
                    <legend className="mb-3 text-md font-bold">
                        Price range
                    </legend>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                htmlFor="filter-price-min"
                                className="mb-1 block text-xs text-gray-500"
                            >
                                Minimum
                            </label>

                            <input
                                id="filter-price-min"
                                type="number"
                                min={0}
                                value={localFilters.prices.min ?? ""}
                                onChange={(e) =>
                                    updatePrice("min", e.target.value)
                                }
                                placeholder="No minimum"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="filter-price-max"
                                className="mb-1 block text-xs text-gray-500"
                            >
                                Maximum
                            </label>

                            <input
                                id="filter-price-max"
                                type="number"
                                min={0}
                                value={localFilters.prices.max ?? ""}
                                onChange={(e) =>
                                    updatePrice("max", e.target.value)
                                }
                                placeholder="No maximum"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                            />
                        </div>
                    </div>
                </fieldset>

                {/* Statuses */}
                <fieldset>
                    <legend className="mb-3 text-md font-bold">
                        Status
                    </legend>

                    <div className="space-y-1">
                        {statuses.map((status) => (
                            <label
                                key={status.value}
                                className="flex cursor-pointer items-center gap-2 rounded-md p-2 hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={localFilters.statuses.includes(
                                        status.value
                                    )}
                                    onChange={() =>
                                        toggleStatus(status.value)
                                    }
                                    className="h-4 w-4 rounded border-gray-300"
                                />

                                <span className="text-sm text-gray-700">
                                    {status.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4">
                <GenericButton
                    type="neutral"
                    action={handleCancel}
                >
                    Cancel
                </GenericButton>

                <GenericButton
                    type="primary"
                    action={handleApply}
                >
                    Apply filters
                </GenericButton>
            </div>
        </div>
    )
}

export default SearchFiltersMenu