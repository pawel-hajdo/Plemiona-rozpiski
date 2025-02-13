import {CommandsTable} from "@/components/commandsTable";

export default function Home() {
    return (
        <div className="flex flex-col items-center p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Twoje komendy do wysłania</h1>
            <CommandsTable deleted={false}/>
        </div>
    );
}
