"use client"

import * as React from "react"
import {
    CaretSortIcon,
    ChevronDownIcon,
} from "@radix-ui/react-icons"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable, PaginationState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    getDeletedCommands,
    getPlayerCommands, getSittingsCommands,
    getSittingsDeletedCommands,
    restoreCommands,
    softDeleteCommands
} from "@/lib/api";
import {useEffect, useState} from "react";
import {
    loadColumnVisibility,
    loadLinksToOpenCount,
    loadPageSize, loadSortingPreference,
    saveColumnVisibility,
    savePageSize
} from "@/lib/localStorage";
import {formatDate, fuzzyFilter, generateLink, getPlayerId, isButtonDisabled} from "@/lib/utils";
import PaginationControls from "@/components/paginationControlrs";
import TableContainer from "@/components/tableContainer";
import { DateTime } from 'luxon';
import {ColumnNames, Command} from "@/lib/types";

export function CommandsTable({deleted} :any) {
    const [commands, setCommands] = useState<Command[]>([]);
    const [sorting, setSorting] = React.useState<SortingState>([loadSortingPreference()])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: loadPageSize(),
    })
    const [clickedRows, setClickedRows] = React.useState<any>({});
    const [linksToOpenCount, setLinkToOpenCount] = React.useState(0);
    const playerId = getPlayerId();
    const [error, setError] = useState("")
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCommandsData = async () => {
            try {
                let playerData;
                let sitterData;

                if(deleted) {
                    playerData = await getDeletedCommands(playerId);
                    sitterData = await getSittingsDeletedCommands(playerId);
                } else {
                    playerData = await getPlayerCommands(playerId);
                    sitterData = await getSittingsCommands(playerId);
                }
                const combinedData = [...playerData, ...sitterData];
                setCommands(combinedData);
                setIsLoading(false);
            } catch (error) {
                setError("Pobranie komend nie powiodło się");
            }
        };
        setColumnVisibility(loadColumnVisibility());
        fetchCommandsData();
        setLinkToOpenCount(loadLinksToOpenCount);
    }, []);

    useEffect(() => {
        if (Object.keys(columnVisibility).length > 0) {
            saveColumnVisibility(columnVisibility);
        }
    }, [columnVisibility]);

    useEffect(() => {
        savePageSize(pagination.pageSize);
    }, [pagination.pageSize]);

    const openLinksInTabs = () => {
        const rows = table.getRowModel().rows;
        let openedCount = 0;
        rows.forEach((row, index) => {
            const rowId = row.id;
            const link = generateLink(row);

            if (!clickedRows[rowId] && !isButtonDisabled(row) && openedCount < linksToOpenCount) {
                setTimeout(() => {
                    window.open(link, '_blank');
                    handleClickLink(rowId);
                }, openedCount * 150);
                openedCount++;
            }
        });
    };

    const handleClickLink = (rowId: any) => {
        setRowSelection((prev:any) => ({ ...prev, [rowId]: true }));
        setClickedRows((prev: any) => ({ ...prev, [rowId]: true }));
    };

    const getRowClasses = (row: any) => {
        const currentTime = DateTime.now().setZone('Europe/Warsaw');

        const minTime = DateTime.fromISO(row.original.minTime, { zone: 'Europe/Warsaw' });
        const maxTime = DateTime.fromISO(row.original.maxTime, { zone: 'Europe/Warsaw' });

        if (currentTime > maxTime) {
            return 'bg-red-800 hover:bg-red-600 dark:bg-red-900 dark:hover:bg-red-700';
        } else if (currentTime < minTime) {
            return 'bg-gray-500 hover:bg-gray-400 dark:bg-gray-900 dark:hover:bg-gray-600';
        }
        return '';
    };

    const handleDeleteSelected = async () => {
        const selectedRows = Object.keys(rowSelection);
        if (selectedRows.length === 0) return;

        const selectedCommands = selectedRows.map(rowId => {
            const row = table.getRow(rowId);
            return row.original.id;
        });

        try {
            await softDeleteCommands(selectedCommands, playerId);
            const updatedCommands = await getPlayerCommands(playerId);
            setCommands(updatedCommands);
            setRowSelection({});
            setClickedRows({});
        } catch (error) {
            setError("Wystąpił błąd podczas usuwania komend");
        }
    };

    const handleRestoreSelected = async () => {
        const selectedRows = Object.keys(rowSelection);
        if (selectedRows.length === 0) return;

        const selectedCommands = selectedRows.map(rowId => {
            const row = table.getRow(rowId);
            return row.original.id;
        });

        try {
            await restoreCommands(selectedCommands, playerId);
            const updatedCommands = await getDeletedCommands(playerId);
            setCommands(updatedCommands);
            setRowSelection({});
            setClickedRows({});
        } catch (error) {
            setError("Wystąpił błąd podczas przywracania komend");
        }
    }

    const columnNames: ColumnNames = {
        commandNumberId: "ID",
        minTime: "Min time",
        maxTime: "Max time",
        source: "Źródło",
        target: "Cel",
        type: "Typ",
        commandCount: "Ilość",
        link: "Link",
        world: "Świat"
    };

    const columns: ColumnDef<Command>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
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
                const minTime = new Date(row.original.minTime);
                const maxTime = new Date(row.original.maxTime);
                const isWithinOneHour = (maxTime.getTime() - minTime.getTime()) <= 3600000;

                return (
                    <div className={isWithinOneHour ? 'font-semibold text-green-500 dark:text-green-400' : ''}>
                        {row.getValue("type")}
                    </div>
                );
            },
        },
        {
            accessorKey: "commandCount",
            header: columnNames.commandCount,
            cell: ({ row }) => <div>{row.getValue("commandCount")}</div>,
        },
        {
            accessorKey: "link",
            header: columnNames.link,
            cell: ({ row }) => {
                const commandPlayerId = row.original.playerId;
                const buttonName = (commandPlayerId == playerId) ? columnNames.link : "Zast";
                const link = generateLink(row);
                return (
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ pointerEvents: isButtonDisabled(row) || clickedRows[row.id] ? 'none' : 'auto' }}
                    >
                        <Button
                            variant="outline"
                            onClick={() => handleClickLink(row.id)}
                            style={{
                                backgroundColor: isButtonDisabled(row) || clickedRows[row.id] ? 'gray' : 'none',
                            }}
                        >
                            {buttonName}
                        </Button>
                    </a>
                );
            },
        },
        {
            accessorKey: "world",
            header: columnNames.world,
            cell: ({ row }) => <div>{row.getValue("world")}</div>,
        },
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
                {deleted ? (
                    <Button
                        onClick={handleRestoreSelected}
                        variant="outline"
                        disabled={Object.keys(rowSelection).length === 0}
                    >
                        Przywróć
                    </Button>
                ) : (
                    <Button
                        onClick={handleDeleteSelected}
                        variant="outline"
                        disabled={Object.keys(rowSelection).length === 0}
                    >
                        Usuń
                    </Button>
                )}
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
                <Button
                    onClick={openLinksInTabs}
                    variant={"outline"}
                >
                    Otwórz {linksToOpenCount}
                </Button>
                <Input
                    placeholder="Filtruj po kordach lub typie rozkazu..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(String(event.target.value))}
                    className="max-w-[60%] xs:max-w-[65%] sm:max-w-sm"
                />
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
                handleClickLink={handleClickLink}
            />
            <PaginationControls table={table} />
        </div>
    )
}
