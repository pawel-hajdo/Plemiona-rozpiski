export default async function LateCommandsPage({ params }: PageProps) {
    return (
        <div className="p-4">
            Spóźnione komendy – Świat {params.world}
        </div>
    )
}
