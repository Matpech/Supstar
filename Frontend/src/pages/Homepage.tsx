import { useEffect, useState } from "react"
import StatCard from "../components/ui/StatCard"
import { useAuth } from "../hooks/useAuth"
import { useApiClient } from "../hooks/useApiClient"
import type { UserStats } from "../types/api"
import toast from "react-hot-toast"
import SkeletonStatCards from "../components/skeletons/SkeletonStatCards"

function Homepage() {
    const auth = useAuth()
    const { request } = useApiClient()

    const [stats, setStats] = useState<UserStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            // Fetch stats
            const statsResponse = await request("/self/stats")
            if (statsResponse.code === 200) {
                setStats(statsResponse.json)
            } else {
                toast.error(`Failed to fetch your stats (${statsResponse.json.error})`)
            }

            // Artificial delay to check skeletons (remove in prod)
            setTimeout(() => setLoading(false), 3000)
            //setLoading(false)
        }

        fetchData()
    }, [])

    return (
        <div className="max-w-7xl mx-2 md:mx-auto md:p-0">
            <header className="py-12">
                <h2 className="text-3xl md:text-5xl">Welcome, {auth.ctx.user?.username || "User"}</h2>
                <p className="md:text-2xl italic">What will you discover today ?</p>
            </header>

            {loading && (<SkeletonStatCards />)}
            {!loading && stats && (<section className="grid grid-cols-2 gap-4 md:flex md:gap-8 md:justify-center">
                <StatCard label="locations on your list" value={stats.personal_locations} />
                <StatCard label="reviews published" value={stats.reviews_published} />
                <StatCard label="average rating" value={stats.average_rating} />
                <StatCard label="shared lists owned" value={stats.lists_owned} />
            </section>)}
        </div>
    )
}

export default Homepage