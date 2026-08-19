import { useEffect, useState } from "react"
import StatCard from "../components/ui/StatCard"
import { useAuth } from "../hooks/useAuth"
import { useApiClient } from "../hooks/useApiClient"
import { ApiError, type SharedList, type UserStats } from "../types/api"
import toast from "react-hot-toast"
import SkeletonStatCards from "../components/skeletons/SkeletonStatCards"
import SharedListBrowser from "../components/SharedListBrowser"
import { useSharedLists } from "../hooks/useSharedLists"
import { Link } from "react-router-dom"
import SkeletonSLBrowser from "../components/skeletons/SkeletonSLBrowser"

function Homepage() {
    const auth = useAuth()
    const { request } = useApiClient()
    const { getAvailableSharedLists } = useSharedLists()

    const [stats, setStats] = useState<UserStats | null>(null)
    const [sharedLists, setSharedLists] = useState<SharedList[]>([])
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

            // Fetch available lists
            try {
                const lists = await getAvailableSharedLists()
                setSharedLists(lists)
            } catch (error) {
                if (error instanceof ApiError) {
                    toast.error(`Failed to fetch shared lists (${error.error})`)
                } else {
                    toast.error("Failed to fetch shared lists")
                }
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

            {/* Statistics about the user */}
            {loading && (<SkeletonStatCards />)}
            {!loading && stats && (<section className="grid grid-cols-2 gap-4 md:flex md:gap-8 md:justify-center">
                <StatCard label="locations on your list" value={stats.personal_locations} />
                <StatCard label="reviews published" value={stats.reviews_published} />
                <StatCard label="average rating" value={stats.average_rating} />
                <StatCard label="shared lists owned" value={stats.lists_owned} />
            </section>)}

            {/* Lists browser */}
            <section className="flex flex-col justify-center border-2 rounded-2xl w-full mt-12">
                <div className="flex items-center justify-between p-4">
                    <h2 className="text-2xl md:text-4xl">List browser</h2>
                    <Link
                        to="/new-list"
                        className="
                            rounded-lg bg-green-600 px-4 py-3
                            text-sm font-semibold text-white text-center
                            shadow-sm transition
                            hover:bg-green-700
                            focus:outline-none focus:ring-2
                            focus:ring-green-500 focus:ring-offset-2
                            active:bg-green-800
                        "
                    >
                        New
                    </Link>
                </div>

                {loading && (<SkeletonSLBrowser />)}
                {!loading && (<SharedListBrowser sharedLists={sharedLists} />)}
            </section>
        </div>
    )
}

export default Homepage