import { UserRound, UsersRound } from "lucide-react"
import type { SharedList } from "../types/api"
import { useAuth } from "../hooks/useAuth"
import { Link } from "react-router-dom"

interface Props {
    sharedLists: SharedList[]
}

function SharedListBrowser({ sharedLists }: Props) {
    const { ctx } = useAuth()
    let selfId: number

    if (!ctx.user) {
        selfId = 0
        throw new Error("")
    } else {
        selfId = ctx.user.id
    }

    return (
        <table className="w-full table-fixed">
            <thead>
                <tr className="border-b border-black">
                    <th className="w-1/3 md:w-1/4 px-4 py-3 text-left font-semibold">Name</th>
                    <th className="w-2/3 md:w-3/4 px-4 py-3 text-left font-semibold">Description</th>
                </tr>
            </thead>

            <tbody>
                <tr className="even:bg-gray-200">
                    <td className="px-4 py-3">
                        <Link to={`/user/${selfId}/list`}>
                            <div className="flex items-center gap-2">
                                <UserRound className="shrink-0 hidden md:block" />
                                <span className="text-xs md:text-sm">My list</span>
                            </div>
                        </Link>
                    </td>
                    <td className="px-4 py-3 text-xs md:text-sm">
                        Your personal list of locations
                    </td>
                </tr>

                {sharedLists.map(sl => (
                    <tr
                        key={sl.list_id}
                        className="even:bg-gray-200"
                    >
                        <td className="px-4 py-3">
                            <Link to={`/list/${sl.list_id}`}>
                                <div className="flex items-center gap-2">
                                    <UsersRound className="shrink-0 hidden md:block" />
                                    <span className="truncate text-xs md:text-sm">{sl.name}</span>
                                </div>
                            </Link>
                        </td>
                        <td className="px-4 py-3">
                            <span className="truncate block text-xs md:text-sm">
                                {sl.description || ""}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default SharedListBrowser