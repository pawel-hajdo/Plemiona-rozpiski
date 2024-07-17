"use client"
import { ModeToggle } from "@/components/modeToogle";
import {useEffect, useState} from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    loadLinksToOpenCount,
    loadSortingPreference,
    saveLinksToOpenCount,
    saveSortingPreference
} from "@/components/localStorage";


export default function Settings() {
    const [commandsCount, setCommandsCount] = useState(loadLinksToOpenCount);
    const [sorting, setSorting] = useState(() => {
        const sortingPreference = loadSortingPreference();
        return `${sortingPreference.id}|${sortingPreference.desc ? 'DESC' : 'ASC'}`;
    });

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

    return (
        <div className="flex flex-col p-2 sm:p-8">
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
        </div>
    );
}
