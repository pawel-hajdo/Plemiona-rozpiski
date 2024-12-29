"use client"
import * as React from "react";
import {getLatestReports, getPlayersWithReports} from "@/lib/api";
import {PaginatedReportsResponse, Player} from "@/lib/types";
import {useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Label} from "@/components/ui/label";

export default function ReportsPage(){
    const [reports, setReports] = useState<Report[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>("all");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [totalReports, setTotalReports] = useState(0);

    useEffect(() => {
        const fetchPlayers = async () => {
            const playersData = await getPlayersWithReports();
            setPlayers(playersData);
        };

        fetchPlayers();
    }, []);

    useEffect(() => {
        const fetchReportsData = async () => {
            try {
                const response: PaginatedReportsResponse = await getLatestReports(page, 50, 'createdAt', false, selectedPlayerId === "all" ? null : selectedPlayerId);
                setReports(response.content);
                setTotalPages(response.totalPages);
                setTotalReports(response.totalElements);
            } catch (error) {
                console.error("Błąd podczas pobierania raportów:", error);
            }
        };

        fetchReportsData();
    }, [selectedPlayerId, page]);

    const handlePlayerChange = (value: string) => {
        setSelectedPlayerId(value);
    };

    return (
        <div className="p-2 sm:p-8">
            <h1 className="text-3xl font-bold mb-6">Raporty admin</h1>

            <Label className="text-md">Pokaż raporty gracza:</Label>
            <Select value={selectedPlayerId || ""} onValueChange={handlePlayerChange}>
                <SelectTrigger className="mb-4 p-2 border border-gray-300 rounded max-w-xs sm:max-w-[300px]">
                    <SelectValue placeholder="Wybierz gracza" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="all">Wybierz gracza</SelectItem>
                        {players.map((player) => (
                            <SelectItem key={player.playerId} value={player.playerId}>
                                {player.playerName}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Id</TableHead>
                        <TableHead>Id raportu</TableHead>
                        <TableHead>Id gracza</TableHead>
                        <TableHead>Data utworzenia</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reports.map((report) => (
                        <TableRow key={report.id}>
                            <TableCell>{report.id}</TableCell>
                            <TableCell>{report.reportId}</TableCell>
                            <TableCell>{report.playerId}</TableCell>
                            <TableCell>{new Date(report.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex items-center justify-between py-4">
                <span className="text-sm">
                    Strona {page + 1} z {totalPages} | Łączna liczba raportów: {totalReports}
                </span>

                <div className="space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 0}
                    >
                        Poprzednia
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page >= totalPages - 1}
                    >
                        Następna
                    </Button>
                </div>
            </div>
        </div>
    );
}
