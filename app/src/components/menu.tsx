import Link from 'next/link';
import {ModeToggle} from "@/components/modeToogle";

const Menu = () => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-lg font-bold">MyApp</div>
                <div className="flex space-x-4">
                    <Link href="/" className="text-gray-300 hover:text-white">Home</Link>
                    <Link href="/settings" className="text-gray-300 hover:text-white">Ustawienia</Link>
                    <Link href="#" className="text-gray-300 hover:text-white">Wyloguj</Link>
                    <ModeToggle/>
                </div>
            </div>
        </nav>
    );
};

export default Menu;
