"use client"

import {FormEvent, useEffect, useState} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {resetPassword} from "@/lib/api";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {EyeClosedIcon, EyeOpenIcon} from "@radix-ui/react-icons";
import {AxiosError} from "axios";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import * as React from "react";
import {generateRandomCode} from "@/lib/utils";

export default function Register() {
    const [userLogin, setUserLogin] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [code, setCode] = useState("");
    const [world, setWorld] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const generatedCode = generateRandomCode();
        setCode(generatedCode);
    }, []);


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");

        if (!userLogin || !userPassword || !world) {
            setError("Proszę wypełnić wszystkie pola.");
            return;
        }
        setIsSubmitting(true);

        try {
            await resetPassword(userLogin, userPassword, code, world);
            router.push("/login");
        } catch (error) {
            if (error instanceof AxiosError) {
                switch (error.response?.status) {
                    case 404:
                        setError("Nie ma takiego gracza")
                        break;
                    case 400:
                        setError("Kod na profilu jest niepoprawny lub nie ma takiego nicku.");
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
                <h1 className="text-2xl font-semibold mt-2 mb-4 dark:text-gray-200">Resetowanie hasła</h1>
                <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600 mb-4">
                    <p>Aby zresetować hasło, tak samo jak przy rejestracji wklej gdziekolwiek w swoim profilu następujący kod:</p>
                    <p className="mt-2">{code}</p>
                    <p className="mt-2">Po zresetowaniu hasła możesz usunąć kod z profilu.</p>
                </div>
                <Label htmlFor="world" className="dark:text-gray-200">Wybierz świat</Label>
                <Select
                    value={world}
                    onValueChange={(value) => setWorld(value)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Świat" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="pl206">pl206</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
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
                <Label htmlFor="password" className="dark:text-gray-200">Nowe hasło</Label>
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
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Wysyłanie..." : "Zresetuj hasło"}</Button>
                <div className="mt-4 text-center">
                    <Label htmlFor="new" className="text-gray-600 dark:text-gray-200">Powrót do logowania</Label>
                    <Link href="/login" className="text-blue-500 hover:underline ml-2">Zaloguj się</Link>
                </div>
            </form>
        </div>
    )
}
