"use client"

import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {authUser} from "@/lib/api";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function Login() {

    const [userLogin, setUserLogin] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!userLogin || !userPassword) {
            setError("Proszę wypełnić wszystkie pola.");
            return;
        }
        setIsSubmitting(true);

        try {
            const responseData = await authUser(userLogin, userPassword);
            document.cookie = `token=${responseData.token}; path=/`;
            router.push("/");
        } catch (error) {
            setError("Błąd logowania. \n Sprawdź dane i spróbuj ponownie.");
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <div className="flex flex-col items-center p-2 sm:p-8">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 bg-white dark:bg-gray-800 p-2 sm:p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h1 className="text-2xl font-semibold mb-4 dark:text-gray-200">Logowanie</h1>
                <Label htmlFor="login" className="dark:text-gray-200">Login</Label>
                <Input
                    type="text"
                    id="login"
                    placeholder="Wpisz login..."
                    value={userLogin}
                    onChange={(e) => setUserLogin(e.target.value)}
                    className="p-3 border border-gray-300 rounded-md"
                />
                <Label htmlFor="password" className="dark:text-gray-200">Hasło</Label>
                <Input
                    type="password"
                    id="password"
                    placeholder="Wpisz hasło..."
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="p-3 border border-gray-300 rounded-md"
                />
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Wysyłanie..." : "Zaloguj się"}</Button>
                <div className="mt-4 text-center">
                    <Label htmlFor="new" className="text-gray-600 dark:text-gray-200">Nie masz konta?</Label>
                    <Link href="/register" className="text-blue-500 hover:underline ml-2">Zarejestruj się</Link>
                </div>
            </form>
        </div>
    )
}
