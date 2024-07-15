"use client"

import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {authUser} from "@/lib/api";

export default function Login() {
    const [userLogin, setUserLogin] = useState("")
    const [userPassword, setUserPassword] = useState("")
    const [errors, setErrors] = useState({
        auth: null
    });


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log(userLogin, userPassword);
            const responseData = await authUser(userLogin, userPassword);
            localStorage.setItem('token', responseData.token);
        } catch (error) {
            setErrors({ auth: error.response.data});
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-8">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2"
            >
                <Label htmlFor="userName" >Login</Label>
                <Input
                    type="text"
                    id="username"
                    placeholder="Wpisz login..."
                    value={userLogin}
                    onChange={(e) => setUserLogin(e.target.value)}
                >
                </Input>
                <Label htmlFor="password" >Hasło</Label>
                <Input
                    type="password"
                    id="password"
                    placeholder="Wpisz hasło..."
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                >
                </Input>
                <Button type="submit">Zaloguj się</Button>
                {errors.auth && (
                    <div className="text-red-700" style={{marginTop: 4}}>{errors.auth}</div>
                )}
                <div className="flex">
                    <Label htmlFor="new" className="p-1">Nie masz konta?</Label>
                    <Link href="/register" className="hover:underline">Zarejestruj się</Link>
                </div>

            </form>
        </div>
    );
}
