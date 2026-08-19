function SkeletonStatCards() {
    return (
        <section className="grid grid-cols-2 gap-4 md:flex md:gap-8 md:justify-center">
            {Array.from({ length: 4 }).map((_, index) => (
                <div
                    key={index}
                    className="
                        w-full md:w-56 h-40
                        rounded-4xl
                        bg-gray-300
                        animate-pulse
                    "
                />
            ))}
        </section>
    )
}

export default SkeletonStatCards