export default async function VillageCommandsPage({ params }: PageProps) {
    return (
        <div className="p-4">
            Komendy na wiosce – Świat {params.world}
        </div>
    )
}
