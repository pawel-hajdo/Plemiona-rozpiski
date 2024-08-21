"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {FormEvent, useState} from "react";
import {setAccountSitter} from "@/lib/api";
import {getPlayerId} from "@/lib/utils";
import {AxiosError} from "axios";

export default function Sitting() {
    const [sitterName, setSitterName] = useState("");
    const [world, setWorld] = useState("");
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitSittingRequest = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if(!sitterName || !world){
            setError("Proszę wypełnić wszystkie pola.");
            return;
        }
        setIsSubmitting(true);

        try {
            await setAccountSitter(getPlayerId(), sitterName, world);
        } catch (error) {
            if (error instanceof AxiosError) {
                switch (error.response?.status) {
                    case 409:
                        setError("Użytkownik ma już ustawionego zastępce na tym świecie.");
                        break;
                    case 400:
                        setError("Nie ma takiego gracza");
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

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Zastępstwa</h1>
            <form onSubmit={handleSubmitSittingRequest}>
                <Label htmlFor="sittingPlayerName" className="mb-2 block text-lg font-semibold">
                    Poproś o zastępstwo na koncie
                </Label>
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
                    <Input
                        id="sittingPlayerName"
                        value={sitterName}
                        onChange={(e) => setSitterName(e.target.value)}
                        placeholder="Wpisz nick gracza"
                        className="w-full sm:w-60"
                    />
                    <Select
                        value={world}
                        onValueChange={(value) => setWorld(value)}
                    >
                        <SelectTrigger className="w-full sm:w-[100px]">
                            <SelectValue placeholder="Świat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="pl200">pl200</SelectItem>
                                <SelectItem value="pl199">pl199</SelectItem>
                                <SelectItem value="pl198">pl198</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button type="submit" >
                        {isSubmitting ? "Wysyłanie..." : "Nadaj zastępstwo"}
                    </Button>
                    {error && <p className="text-red-500">{error}</p>}
                </div>
            </form>
        </div>
    );
}
