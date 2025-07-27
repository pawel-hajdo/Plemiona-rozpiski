import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarItems = [
    { href: "late-commands", label: "Spóźnione komendy" },
    { href: "player-commands", label: "Rozpiska gracza" },
    { href: "village-commands", label: "Komendy na wiosce" },
    { href: "delete-villages", label: "Usuwanie wiosek" },
];

export default function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { world: string };
}) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row text-black dark:text-white">
            <aside className="w-full md:w-64 bg-gray-100 dark:bg-gray-900 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                <h2 className="text-lg md:text-xl font-bold mb-4">
                    Admin: {params.world}
                </h2>
                <nav className="grid grid-cols-2 md:block gap-2">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={`/admin/${params.world}/${item.href}`}
                            className={cn(
                                "block text-center md:text-left",
                                "rounded transition-colors",
                                // mobile size
                                "px-2 py-1 text-sm",
                                // PC size (md and up)
                                "md:px-4 md:py-3 md:text-base",
                                // background hover
                                "hover:bg-gray-200 dark:hover:bg-gray-800"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-2 sm:p-8">
                {children}
            </main>
        </div>
    );
}
