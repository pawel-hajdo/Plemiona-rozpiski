'use client';

import { useEffect, useState } from 'react';
import { getLateCommandsAdmin } from "@/lib/api";
import {AdminCommand, ColumnNames, Command} from "@/lib/types";
import { useRouter } from 'next/navigation';
import {
    ColumnDef, ColumnFiltersState,
    getCoreRowModel, getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel, PaginationState, SortingState,
    useReactTable, VisibilityState
} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {CaretSortIcon, ChevronDownIcon, CrossCircledIcon} from "@radix-ui/react-icons";
import {formatDate, fuzzyFilter} from "@/lib/utils";
import * as React from "react";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import TableContainer from "@/components/tableContainer";
import PaginationControls from "@/components/paginationControlrs";
import {
    loadColumnVisibilityAdmin, loadCommandsFilter,
    loadPageSize,
    loadSortingPreference,
    saveColumnVisibilityAdmin, saveCommandsFilter,
    savePageSize
} from "@/lib/localStorage";
import {DateTime} from "luxon";

interface PageProps {
    params: {
        world: string;
    };
}

export default function LateCommandsPage({ params }: PageProps) {
    const [commands, setCommands] = useState<AdminCommand[]>([]);
    const [sorting, setSorting] = React.useState<SortingState>([loadSortingPreference()])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: loadPageSize(),
    })
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("")
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [commandsFilter, setCommandsFilter] = useState<"all" | "important">(loadCommandsFilter);
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const fetchCommands = async () => {
            try {
                setIsLoading(true);
                setError("");
                const data = await getLateCommandsAdmin(params.world, 0, 10000, commandsFilter);
                setCommands(data);
            } catch (err) {
                console.error('Failed to fetch late commands:', err);

                if (err instanceof Error) {
                    if (err.message.includes('Access denied')) {
                        setError('Brak uprawnień administratora');
                    } else if (err.message.includes('Authentication required')) {
                        router.push('/login');
                        return;
                    } else {
                        setError('Błąd podczas pobierania danych');
                    }
                } else {
                    setError('Nieznany błąd');
                }
            } finally {
                setIsLoading(false);
            }
        };
        setColumnVisibility(loadColumnVisibilityAdmin());
        fetchCommands();
    }, [params.world, router, commandsFilter]);

    useEffect(() => {
        if (Object.keys(columnVisibility).length > 0) {
            saveColumnVisibilityAdmin(columnVisibility);
        }
    }, [columnVisibility]);

    useEffect(() => {
        savePageSize(pagination.pageSize);
    }, [pagination.pageSize]);

    useEffect(() => {
        saveCommandsFilter(commandsFilter);
    }, [commandsFilter]);

    const toggleFilter = () => {
        const newFilter = commandsFilter === "all" ? "important" : "all";
        setCommandsFilter(newFilter);
    };

    const getRowClasses = (row: any) => {
        const currentTime = DateTime.now().setZone('Europe/Warsaw');

        const minTime = DateTime.fromISO(row.original.minTime, { zone: 'Europe/Warsaw' });
        const maxTime = DateTime.fromISO(row.original.maxTime, { zone: 'Europe/Warsaw' });

        if (currentTime > maxTime) {
            return 'bg-red-800 hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-700';
        } else if (currentTime < minTime) {
            return 'bg-gray-500 hover:bg-gray-400 dark:bg-zinc-950 dark:hover:bg-zinc-800';
        }
        return '';
    };

    const columnNames: ColumnNames = {
        commandNumberId: "ID",
        playerName: "Gracz",
        source: "Źródło",
        target: "Cel",
        minTime: "Min time",
        maxTime: "Max time",
        attackTime: "Czas wejścia",
        type: "Typ",
        minutesLate: "Czas spóźnienia"
    };

    const columns: ColumnDef<Command>[] = [
        {
            accessorKey: "commandNumberId",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0"
                >
                    {columnNames.commandNumberId}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("commandNumberId")}</div>,
        },
        {
            accessorKey: "playerName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.playerName}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div>
                    {row.getValue("playerName")}
                </div>
            ),
        },
        {
            accessorKey: "minTime",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.minTime}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{formatDate(new Date(row.getValue('minTime')))}</div>,
        },
        {
            accessorKey: "maxTime",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.maxTime}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{formatDate(new Date(row.getValue('maxTime')))}</div>,
        },
        {
            accessorKey: "attackTime",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.attackTime}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const attackTime = row.getValue('attackTime') as string;

                if (!attackTime) {
                    return <div>Brak danych</div>;
                }

                const [date, time] = attackTime.split(' ');
                const formattedDate = formatDate(new Date(date.replace(/-/g, '/')));

                return (
                    <div>
                        <div>{formattedDate.split(",")[0]}</div>
                        <div>{time}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "source",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.source}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div>
                    <a
                        href={`https://${row.original.world}.plemiona.pl/game.php?village=${row.original.sourceId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {row.getValue("source")}
                    </a>
                </div>
            ),
        },
        {
            accessorKey: "target",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.target}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div>
                    <a
                        href={`https://${row.original.world}.plemiona.pl/game.php?screen=info_village&id=${row.original.targetId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {row.getValue("target")}
                    </a>
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.type}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                return (
                    <div>
                        {row.getValue("type")}
                    </div>
                );
            },
        },
        {
            accessorKey: "minutesLate",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {columnNames.minutesLate}
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const value = row.getValue("minutesLate");
                return <div>{value == null ? "Nie wysłany" : `${value} min`}</div>;
            },
        }
    ]

    const table = useReactTable({
        data: commands,
        columns,
        pageCount: Math.ceil(commands.length / pagination.pageSize),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        globalFilterFn: fuzzyFilter,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
            globalFilter,
        },
        filterFns: {
            fuzzy: fuzzyFilter,
        },
    })

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center py-4 gap-2 sm:gap-3">
                <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={(value) => setPagination({ ...pagination, pageSize: Number(value) })}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Number of commands" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="10">Wyświetl 10</SelectItem>
                            <SelectItem value="20">Wyświetl 20</SelectItem>
                            <SelectItem value="50">Wyświetl 50</SelectItem>
                            <SelectItem value="100">Wyświetl 100</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div className="relative w-[50%] xs:max-w-[65%] sm:max-w-sm">
                    <Input
                        placeholder="Filtruj..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(String(event.target.value))}
                        className="w-full pr-8"
                    />
                    {globalFilter && (
                        <button
                            onClick={() => setGlobalFilter("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            type="button"
                        >
                            <CrossCircledIcon className="h-5 w-5"/>
                        </button>
                    )}
                </div>
                <Button variant="outline" onClick={toggleFilter}>
                    {!isMounted
                        ? "Pokaż ważne"
                        : commandsFilter === "all" ? "Pokaż ważne" : "Pokaż wszystkie"
                    }
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Kolumny <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                const columnName = columnNames[column.id as keyof ColumnNames] || column.id;
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {columnName}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <TableContainer
                isLoading={isLoading}
                error={error}
                columns={columns}
                table={table}
                getRowClasses={getRowClasses}
            />
            <PaginationControls table={table} />
        </div>
    )
}
