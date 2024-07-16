"use client"
import Link from 'next/link';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {usePathname} from "next/navigation";
import {useState} from "react";

const Menu = () => {
    const userName = useState();

    const pathname = usePathname();
    const hideMenu = pathname === '/login' || pathname === '/register';
    if (hideMenu) return null;

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex space-x-4">
                    <Link href="/" className="text-gray-300 hover:text-white">Aktualne</Link>
                    <Link href="/deleted" className="text-gray-300 hover:text-white">Usunięte</Link>
                </div>
                <div className="relative">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="text-gray-300 hover:text-white">
                                Zalogowany jako {userName}
                            </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content
                            className="bg-gray-700 p-2 rounded shadow-lg"
                            sideOffset={5}
                            align="end"
                        >
                            <DropdownMenu.Item className="p-2 hover:bg-gray-600 rounded">
                                <Link href="/settings" className="text-gray-300 hover:text-white">Ustawienia</Link>
                            </DropdownMenu.Item>
                            <DropdownMenu.Item className="p-2 hover:bg-gray-600 rounded">
                                <Link href="#" className="text-gray-300 hover:text-white">Wyloguj</Link>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </div>
            </div>
        </nav>
    );
};

export default Menu;
