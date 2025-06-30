interface AdminWorldPageProps {
    params: {
        world: string;
    };
}

const AdminWorldPage = ({ params }: AdminWorldPageProps) => {
    const { world } = params;

    return (
        <main className="p-8">
            <h1 className="text-3xl font-bold mb-4">Panel administracyjny</h1>
            <p className="text-lg">Jesteś aktualnie na świecie: <strong>{world}</strong></p>

            {/* Dodaj tu inne komponenty panelu admina dla danego świata */}
        </main>
    );
};

export default AdminWorldPage;
