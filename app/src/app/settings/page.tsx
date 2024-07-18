"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import * as React from "react";
import {ModeToggle} from "@/components/modeToogle";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {useState} from "react";
import {
    loadLinksToOpenCount,
    loadSortingPreference,
    saveLinksToOpenCount,
    saveSortingPreference
} from "@/lib/localStorage";
import {updateUser} from "@/lib/api";
import {getPlayerName} from "@/lib/utils";
import Cookies from "js-cookie";

export default function Settings() {
    const [commandsCount, setCommandsCount] = useState(loadLinksToOpenCount);
    const [sorting, setSorting] = useState(() => {
        const sortingPreference = loadSortingPreference();
        return `${sortingPreference.id}|${sortingPreference.desc ? 'DESC' : 'ASC'}`;
    });
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newPasswordConfirm, setNewPasswordConfirm] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCommandsCountChange = (value) => {
        setCommandsCount(value);
        saveLinksToOpenCount(value);
    };

    const handleSortingChange = (value) => {
        const [id, order] = value.split('|');
        const sortingPreference = { id, desc: order === 'DESC' };
        setSorting(value);
        saveSortingPreference(sortingPreference);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!oldPassword || !newPassword || !newPasswordConfirm) {
            setError("Proszę wypełnić wszystkie pola.");
            return;
        }

        if(newPassword != newPasswordConfirm){
            setError("Sprawdź poprawność pól")
            return;
        }
        setIsSubmitting(true);

        try {
            const userLogin = getPlayerName();
            const responseData = await updateUser(userLogin, oldPassword, newPassword);
            Cookies.remove('token');
            window.location.reload();
        } catch (error) {
            setError("Wystąpił błąd. \n Sprawdź dane i spróbuj ponownie.");
            console.log(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Ustawienia</h1>
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <Label className="text-lg">Motyw strony:</Label>
                <ModeToggle />
            </div>
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <Label className="text-lg">Ilość otwieranych komend jednym kliknięciem:</Label>
                <Select
                    value={commandsCount.toString()}
                    onValueChange={handleCommandsCountChange}
                >
                    <SelectTrigger className="max-w-xs sm:max-w-[120px]">
                        <SelectValue placeholder="Wybierz rodzaj sortowania" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="30">30</SelectItem>
                            <SelectItem value="40">40</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <Label className="text-lg">Domyślny rodzaj sortowania:</Label>
                <Select
                    value={sorting}
                    onValueChange={handleSortingChange}
                    className="max-w-xs"
                >
                    <SelectTrigger className="max-w-xs sm:max-w-[200px]">
                        <SelectValue placeholder="Wybierz rodzaj sortowania" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="minTime|ASC">minTime rosnąco</SelectItem>
                            <SelectItem value="minTime|DESC">minTime malejąco</SelectItem>
                            <SelectItem value="maxTime|ASC">maxTime rosnąco</SelectItem>
                            <SelectItem value="maxTime|DESC">maxTime malejąco</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <Label className="text-lg">Zmiana hasła:</Label>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline">Zmień hasło</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Zmiana hasła</DialogTitle>
                            <DialogDescription>Wprowadź nowe hasło.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="current-password">Aktualne hasło:</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    name="current-password" required
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="new-password">Nowe hasło:</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    name="new-password" required
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="confirm-password">Potwierdź nowe hasło:</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    name="confirm-password" required
                                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="mt-4">{isSubmitting ? "Wysyłanie..." : "Zapisz"}</Button>
                            </DialogFooter>
                            {error && <p className="text-red-500">{error}</p>}
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
