import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delay = 2000) {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const id = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            window.clearTimeout(id)
        }
    }, [value, delay])

    return debouncedValue
}