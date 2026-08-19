function SkeletonSLBrowser() {
    return (
        <table className="w-full table-fixed">
            <thead>
                <tr className="border-b border-black">
                    <th className="w-1/3 md:w-1/4 px-4 py-3 text-left font-semibold">Name</th>
                    <th className="w-2/3 md:w-3/4 px-4 py-3 text-left font-semibold">Description</th>
                </tr>
            </thead>

            <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="even:bg-gray-200">
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-gray-300 animate-pulse shrink-0" />
                                <div className="h-5 w-24 bg-gray-300 rounded animate-pulse" />
                            </div>
                        </td>

                        <td className="px-4 py-3">
                            <div className="h-5 w-3/4 bg-gray-300 rounded animate-pulse" />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default SkeletonSLBrowser