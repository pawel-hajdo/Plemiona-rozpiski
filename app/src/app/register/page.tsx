"use client"

import {useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {registerUser} from "@/lib/api";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function Register() {

    const [userLogin, setUserLogin] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [code, setCode] = useState("");
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const generatedCode = generateRandomCode();
        setCode(generatedCode);
    }, []);

    const generateRandomCode = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = 32;
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!userLogin || !userPassword) {
            setError("Proszę wypełnić wszystkie pola.");
            return;
        }
        setIsSubmitting(true);

        try {
            const responseData = await registerUser(userLogin, userPassword, code);
            document.cookie = `token=${responseData.token}; path=/`;
            router.push("/");
        } catch (error) {
            setError(error.response.data);
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
                <h1 className="text-2xl font-semibold mt-2 mb-4 dark:text-gray-200">Rejestracja</h1>
                <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 mb-4">
                    <p>Użyj swojego konta w Plemionach, aby się zarejestrować. Aby to zrobić, wklej gdziekolwiek w swoim profilu następujący kod:</p>
                    <p className="mt-2">{code}</p>
                    <p className="mt-2">Gdy już się zarejestrujesz, możesz usunąć kod z profilu.</p>
                </div>
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
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Wysyłanie..." : "Zarejestruj się"}</Button>
                <div className="mt-4 text-center">
                    <Label htmlFor="new" className="text-gray-600">Masz już konto?</Label>
                    <Link href="/login" className="text-blue-500 hover:underline ml-2">Zaloguj się</Link>
                </div>
            </form>
        </div>
    )
}
