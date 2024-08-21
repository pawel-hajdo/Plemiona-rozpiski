"use client"
import Link from 'next/link';
import {usePathname} from "next/navigation";
import Cookies from 'js-cookie';
import {HamburgerMenuIcon} from "@radix-ui/react-icons"
import * as React from "react";
import {Disclosure} from "@headlessui/react";
import {useEffect, useState} from "react";
import {getPlayerName} from "@/lib/utils";

const navigation = [
    { name: 'Aktualne', href: '/' },
    { name: 'Usunięte', href: '/deleted' },
    { name: 'Inne', href: '/other'},
    { name: 'Zastępstwa', href: '/sitting'},
    { name: 'Ustawienia', href: '/settings' }
];

const Menu = () => {
    const handleLogout = () => {
        Cookies.remove('token');
        window.location.reload();
    };
    const [playerName, setPlayerName] = useState("");
    useEffect(() => {
        setPlayerName(getPlayerName());
    }, [getPlayerName()]);

    const pathname = usePathname();
    const hideMenu = pathname === '/login' || pathname === '/register';
    if (hideMenu) return null;

    return (
        <Disclosure as="nav" className="bg-gray-800">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                            <span className="sr-only">Otwórz główne menu</span>
                            <HamburgerMenuIcon className="block h-6 w-6" aria-hidden="true" />
                        </Disclosure.Button>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                        {navigation.map((item) => (
                            <Link key={item.name} href={item.href} className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    {item.name}
                            </Link>
                        ))}
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        <span className="text-gray-300 pr-4">{playerName}</span>
                        <button
                            onClick={handleLogout}
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md bg-gray-700 text-sm font-medium"
                        >Wyloguj</button>
                    </div>
                </div>
            </div>
            {/* Mobile menu */}
            <Disclosure.Panel className="sm:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navigation.map((item) => (
                        <Link key={item.name} href={item.href} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                {item.name}
                        </Link>
                    ))}
                </div>
            </Disclosure.Panel>
        </Disclosure>
    );
}

export default Menu;
