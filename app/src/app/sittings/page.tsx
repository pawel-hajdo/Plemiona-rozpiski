"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {FormEvent, useEffect, useState} from "react";
import {
    acceptSittingRequest,
    cancelSittingRequest,
    endSitting,
    getAccountSitters,
    getAccountSittings,
    rejectSittingRequest,
    setAccountSitter
} from "@/lib/api";
import {getPlayerId} from "@/lib/utils";
import {AxiosError} from "axios";
import {AccountSittingStatus} from "@/lib/types";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import { Sitting } from "@/lib/types";

export default function Sittings() {
    const [sitterName, setSitterName] = useState("");
    const [world, setWorld] = useState("");
    const [loadingError, setLoadingError] = useState("")
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accountSitters, setAccountSitters] = useState<Sitting[]>([]);
    const [accountSittings, setAccountSittings] = useState<Sitting[]>([]);
    const [isLoadingSitters, setIsLoadingSitters] = useState(true);
    const [isLoadingSittings, setIsLoadingSittings] = useState(true);
    const playerId = getPlayerId();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountSitterData: Sitting[] = await getAccountSitters(playerId);
                const accountSittingsData: Sitting[] = await getAccountSittings(playerId);
                setAccountSitters(accountSitterData);
                setAccountSittings(accountSittingsData);
            } catch (error) {
                setLoadingError("Wystąpił błąd podczas pobierania zastępstw");
            } finally {
                setIsLoadingSitters(false);
                setIsLoadingSittings(false);
            }
        }
        fetchData();
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
                        setFormError("Aktywny zastępca lub zapytanie o zastępstwo na tym świecie");
                        break;
                    case 400:
                        setFormError("Nie ma takiego gracza.");
                        break;
                    default:
                        setFormError("Wystąpił błąd. Proszę spróbować ponownie.");
                }
            } else {
                setFormError("Wystąpił nieoczekiwany błąd.");
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

    const handleRejectSittingRequest = async (sittingId: number) => {
        try {
            await rejectSittingRequest(playerId, sittingId);
            const data: Sitting[] = await getAccountSittings(playerId);
            setAccountSittings(data);
        } catch {
            setLoadingError("Nie udało się odrzucić prośby. Spróbuj ponownie później");
        }
    }

    const handleAcceptSittingRequest  = async (sittingId: number) => {
        try {
            await acceptSittingRequest(playerId, sittingId);
            const data: Sitting[] = await getAccountSittings(playerId);
            setAccountSittings(data);
        } catch {
            setLoadingError("Nie udało się zaakceptować prośby. Spróbuj ponownie później");
        }
    }

    const handleEndSitting = async (sittingId: number) => {
        try {
            await endSitting(playerId, sittingId);
            const accountSitterData: Sitting[] = await getAccountSitters(playerId);
            const accountSittingsData: Sitting[] = await getAccountSittings(playerId);
            setAccountSitters(accountSitterData);
            setAccountSittings(accountSittingsData);
        } catch {
            setLoadingError("Nie udało się zakończyć zastępstwa. Spróbuj ponownie później");
        }
    }

    const yourRequests = accountSitters.filter(
        sitter => sitter.status === AccountSittingStatus.PENDING || sitter.status === AccountSittingStatus.ACTIVE
    );

    const receivedRequests = accountSittings.filter(
        sitter => sitter.status === AccountSittingStatus.PENDING || sitter.status === AccountSittingStatus.ACTIVE
    );

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Zastępstwa</h1>
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
                                <SelectItem value="pl206">pl206</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button type="submit" variant="secondary">
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
                    {isLoadingSitters ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Pobieranie danych...
                            </TableCell>
                        </TableRow>
                    ) : yourRequests.length ? (
                        yourRequests.map((sitting) => (
                            <TableRow key={sitting.id}>
                                <TableCell>{sitting.sitterName}</TableCell>
                                <TableCell>{sitting.world}</TableCell>
                                <TableCell>
                                    {sitting.status === AccountSittingStatus.PENDING ? (
                                        <Button onClick={() => handleCancelSittingRequest(sitting.id)} variant="destructive">
                                            Anuluj zapytanie
                                        </Button>
                                    ) : sitting.status === AccountSittingStatus.ACTIVE ? (
                                        <Button onClick={() => handleEndSitting(sitting.id)} variant="destructive">
                                            Zakończ zastępstwo
                                        </Button>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Brak próśb o zastępstwo.
                                {loadingError && <p className="text-red-500">{loadingError}</p>}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Label htmlFor="activeRequests" className="mb-2 block text-lg font-semibold">
                Otrzymane zastępstwa
            </Label>
            <Table id="activeRequests" className="mb-5">
                <TableHeader>
                    <TableRow>
                        <TableHead>Nick gracza</TableHead>
                        <TableHead>Świat</TableHead>
                        <TableHead>Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoadingSittings ? (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Pobieranie danych...
                            </TableCell>
                        </TableRow>
                    ) : receivedRequests.length ? (
                        receivedRequests.map((sitting) => (
                            <TableRow key={sitting.id}>
                                <TableCell>{sitting.playerName}</TableCell>
                                <TableCell>{sitting.world}</TableCell>
                                <TableCell>
                                    {sitting.status === AccountSittingStatus.PENDING ? (
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleRejectSittingRequest(sitting.id)} variant="destructive">
                                                Odrzuć
                                            </Button>
                                            <Button onClick={() => handleAcceptSittingRequest(sitting.id)} variant="secondary">
                                                Akceptuj
                                            </Button>
                                        </div>
                                    ) : sitting.status === AccountSittingStatus.ACTIVE ? (
                                        <Button onClick={() => handleEndSitting(sitting.id)} variant="destructive">
                                            Zakończ zastępstwo
                                        </Button>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                Brak otrzymanych zastępstw.
                                {loadingError && <p className="text-red-500">{loadingError}</p>}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
