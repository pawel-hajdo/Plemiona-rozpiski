"use client"

import {useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {registerUser} from "@/lib/api";
import {useRouter} from "next/navigation";
import Link from "next/link";

export default function Register() {

    const [userLogin, setUserLogin] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [code, setCode] = useState(null);
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
            const responseData = await registerUser(userLogin, userPassword, code);
            localStorage.setItem('token', responseData.token);
            console.log(responseData);
            router.push("/");
        } catch (error) {
            setError(error);
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <div className="min-h-screen flex flex-col items-center p-8">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 bg-white p-8 rounded-lg shadow-md w-full max-w-md"
            >
                <h1 className="text-2xl font-semibold mb-4">Rejestracja</h1>
                <Label htmlFor="login">Login</Label>
                <Input
                    type="text"
                    id="login"
                    placeholder="Wpisz login..."
                    value={userLogin}
                    onChange={(e) => setUserLogin(e.target.value)}
                    className="p-3 border border-gray-300 rounded-md"
                />
                <Label htmlFor="password">Hasło</Label>
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
