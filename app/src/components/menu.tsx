"use client"
import Link from 'next/link';
import {usePathname} from "next/navigation";
import Cookies from 'js-cookie';
import {
    NavigationMenu,
    NavigationMenuItem, NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {Button} from "@/components/ui/button";


const Menu = () => {
    const handleLogout = () => {
        Cookies.remove('token');
        window.location.reload();
    };

    const pathname = usePathname();
    const hideMenu = pathname === '/login' || pathname === '/register';
    if (hideMenu) return null;

    return (
        <nav className="bg-gray-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <NavigationMenu>
                    <NavigationMenuList className="flex space-x-4">
                        <NavigationMenuItem>
                            <Link href="/" passHref>
                                <NavigationMenuLink className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                                    Aktualne
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/deleted" passHref>
                                <NavigationMenuLink className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                                    Usunięte
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/settings" passHref>
                                <NavigationMenuLink className="text-gray-300 hover:text-white px-3 py-2 rounded-md">
                                    Ustawienia
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <Button onClick={handleLogout} className="text-gray-300 hover:text-white px-3 py-2 rounded-md bg-gray-700">
                    Wyloguj
                </Button>
            </div>
        </nav>
    );
};

export default Menu;
