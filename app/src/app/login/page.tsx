"use client"

import {FormEvent, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {authUser} from "@/lib/api";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {EyeClosedIcon, EyeOpenIcon} from "@radix-ui/react-icons";
import {AxiosError} from "axios";
import {setCookieToken} from "@/lib/utils";

export default function Login() {
    const [userLogin, setUserLogin] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");

        if (!userLogin || !userPassword) {
            setError("Proszę wypełnić wszystkie pola.");
            return;
        }
        setIsSubmitting(true);

        try {
            const responseData = await authUser(userLogin, userPassword);
            document.cookie = `token=${responseData.token}; path=/; max-age=21600`;
            setCookieToken(responseData.token);
            router.push("/");
        } catch (error) {
            if (error instanceof AxiosError) {
                switch (error.response?.status) {
                    case 404:
                        setError("Błędny login lub hasło")
                        break;
                    case 400:
                        setError("Błędny login lub hasło")
                        break;
                    default:
                        setError("Wystąpił błąd. Proszę spróbować ponownie.");
                }
            } else {
                setError("Wystąpił nieoczekiwany błąd.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const toggleShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

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
                    autoComplete="username"
                />
                <Label htmlFor="password" className="dark:text-gray-200">Hasło</Label>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Wpisz hasło..."
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md pr-10"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={toggleShowPassword}
                        className="absolute right-3 top-2"
                    >
                        {showPassword ? <EyeClosedIcon className="h-6 w-6"/> : <EyeOpenIcon className="h-6 w-6"/>}
                    </button>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Wysyłanie..." : "Zaloguj się"}</Button>
                <div className="mt-4 text-center">
                    <Label htmlFor="reset" className="text-gray-600 dark:text-gray-200">Zapomniałeś hasła?</Label>
                    <Link href="/reset" className="text-blue-500 hover:underline ml-2">Zresetuj hasło</Link>
                </div>
                <div className="text-center">
                    <Label htmlFor="new" className="text-gray-600 dark:text-gray-200">Nie masz konta?</Label>
                    <Link href="/register" className="text-blue-500 hover:underline ml-2">Zarejestruj się</Link>
                </div>
            </form>
        </div>
    )
}
