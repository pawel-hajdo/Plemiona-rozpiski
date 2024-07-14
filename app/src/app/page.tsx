'use client'
import {CommandsTable} from "@/components/commandsTable";
import {useEffect, useState} from "react";
import {getPlayerCommands} from "@/lib/api";


export default function Home() {
    const [commandsData, setCommandsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCommandsData = async () => {
            try {
                const data = await getPlayerCommands(698962117);
                setCommandsData(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCommandsData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-8">
            <h1 className="text-3xl font-bold mb-6">Twoje komendy do wysłania</h1>
            <CommandsTable commands = {commandsData}/>
        </div>
    );
}
