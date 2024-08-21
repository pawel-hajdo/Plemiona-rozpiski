"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {FormEvent, useEffect, useState} from "react";
import {cancelSittingRequest, endSitting, getAccountSitters, setAccountSitter} from "@/lib/api";
import {getPlayerId} from "@/lib/utils";
import {AxiosError} from "axios";
import {AccountSittingStatus} from "@/lib/types";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

export default function Sitting() {
    const [sitterName, setSitterName] = useState("");
    const [world, setWorld] = useState("");
    const [loadingError, setLoadingError] = useState("")
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accountSitters, setAccountSitters] = useState<Sitting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const playerId = getPlayerId();

    useEffect(() => {
        const fetchAccountSitters = async () => {
            try {
                const data: Sitting[] = await getAccountSitters(getPlayerId());
                setAccountSitters(data);
                console.log(data);
            } catch (error) {
                setLoadingError("Wystąpił błąd podczas pobierania zastępstw");
            } finally {
                setIsLoading(false);
            }
        }

        fetchAccountSitters();
    }, []);

    const handleSubmitSittingRequest = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError("");

        if(!sitterName || !world){
            setFormError("Proszę wypełnić wszystkie pola.");
            return;
        }
        setIsSubmitting(true);

        try {
            await setAccountSitter(playerId, sitterName, world);
            const data: Sitting[] = await getAccountSitters(playerId);
            setAccountSitters(data);
        } catch (error) {
            if (error instanceof AxiosError) {
                switch (error.response?.status) {
                    case 409:
                        setLoadingError("Użytkownik ma już ustawionego zastępce na tym świecie.");
                        break;
                    case 400:
                        setLoadingError("Nie ma takiego gracza");
                        break;
                    default:
                        setLoadingError("Wystąpił błąd. Proszę spróbować ponownie.");
                }
            } else {
                setError("Wystąpił nieoczekiwany błąd.");
            }
        } finally {
            setIsSubmitting(false);
            setSitterName("");
            setWorld("");
        }
    }

    const handleCancelSittingRequest = async (sittingId: number) => {
        try {
            await cancelSittingRequest(playerId, sittingId);
            const data: Sitting[] = await getAccountSitters(playerId);
            setAccountSitters(data);
        } catch {
            setLoadingError("Nie udało się anulować zapytania. Spróbuj ponownie później");
        }
    }

    const handleEndSitting = async (sittingId: number) => {
        try {
            await endSitting(playerId, sittingId);
            const data: Sitting[] = await getAccountSitters(playerId);
            setAccountSitters(data);
        } catch {
            setLoadingError("Nie udało się zakończyć zastępstwa. Spróbuj ponownie później");
        }
    }

    const filteredSitters = accountSitters.filter(
        sitter => sitter.status === AccountSittingStatus.PENDING || sitter.status === AccountSittingStatus.ACTIVE
    );
    const rows = filteredSitters.map(sitting => ({
        playerName: sitting.sitterName,
        world: sitting.world,
        actions: sitting.status === AccountSittingStatus.PENDING ? (
            <Button onClick={() => handleCancelSittingRequest(sitting.id)}>
                Anuluj zapytanie
            </Button>
        ) : sitting.status === AccountSittingStatus.ACTIVE ? (
            <Button onClick={() => handleEndSitting(sitting.id)}>
                Zakończ zastępstwo
            </Button>
        ) : null,
    }));

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Zastępstwa</h1>
            {isLoading ? (
                <p>Pobieranie danych...</p>
            ) : loadingError ? (
                    <p className="text-red-500">{loadingError}</p>
            ) : (
                <>
                    <form onSubmit={handleSubmitSittingRequest}>
                        <Label htmlFor="sittingPlayerName" className="mb-2 block text-lg font-semibold">
                            Poproś o zastępstwo na koncie
                        </Label>
                        <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-2">
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
                            {formError && <p className="text-red-500">{formError}</p>}
                        </div>
                    </form>
                    <Label htmlFor="sittingRequests" className="mb-2 block text-lg font-semibold">
                        Twoje prośby o zastępstwo
                    </Label>
                    <Table id="sittingRequests" className="mb-5">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nick gracza</TableHead>
                                <TableHead>Świat</TableHead>
                                <TableHead>Akcje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length > 0 ? (
                                rows.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.playerName}</TableCell>
                                        <TableCell>{row.world}</TableCell>
                                        <TableCell>{row.actions}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">Brak próśb o zastępstwo</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </>
            )}
        </div>
    );
}
