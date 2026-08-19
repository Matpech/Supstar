interface Props {
    label: string
    value: any
}

function StatCard(props: Props) {
    return (
        <div className="flex flex-col items-center justify-center text-center border-2 rounded-4xl p-2 w-full md:w-56 h-40">
            <p className="text-2xl md:text-4xl font-bold">{props.value}</p>
            <p className="md:text-2xl">{props.label}</p>
        </div>
    )
}

export default StatCard