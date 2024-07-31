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
    flexRender,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {getDeletedCommands, getPlayerCommands, restoreCommands, softDeleteCommands} from "@/lib/api";
import {useEffect, useState} from "react";
import {
    loadColumnVisibility,
    loadLinksToOpenCount,
    loadPageSize,
    saveColumnVisibility,
    savePageSize
} from "@/lib/localStorage";
import {getPlayerId} from "@/lib/utils";
import {
    rankItem,
} from '@tanstack/match-sorter-utils'

const fuzzyFilter = (row: any, columnId: any, value: any, addMeta: any) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({ itemRank });
    return itemRank.passed;
};

export function CommandsTable({deleted} :any) {
    const [commands, setCommands] = useState([]);
    const [sorting, setSorting] = React.useState<SortingState>([])
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
        setColumnVisibility(loadColumnVisibility());
        fetchCommandsData();
        setLinkToOpenCount(loadLinksToOpenCount);
    }, []);

    useEffect(() => {
        if (Object.keys(columnVisibility).length > 0) {
            saveColumnVisibility(columnVisibility);
        }
    }, [columnVisibility]);

    const fetchCommandsData = async () => {
        try {
            let data;
            if(deleted) {
                data = await getDeletedCommands(playerId);
            } else {
                data = await getPlayerCommands(playerId);
            }
            setCommands(data);
            setIsLoading(false);
        } catch (error) {
            setError("Pobranie komend nie powiodło się");
        }
    };

    useEffect(() => {
        savePageSize(pagination.pageSize);
    }, [pagination.pageSize]);

    const openLinksInTabs = () => {
        const rows = table.getRowModel().rows;
        let openedCount = 0;
        rows.forEach((row, index) => {
            const rowId = row.id;
            const { sourceId, targetId, type, world } = row.original;
            let link = `https://${world}.plemiona.pl/game.php?village=${sourceId}&screen=place&target=${targetId}`;

            const catapultMatch = type.match(/Katapulty-(\d+)/);
            if (catapultMatch) {
                const catapultCount = catapultMatch[1];
                link += `&catapult=${catapultCount}`;
            }

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

    const isButtonDisabled = (row: any) => {
        const currentTime = new Date();
        const minTime = new Date(row.original.minTime);
        return currentTime < minTime;
    };

    const getRowClasses = (row: any) => {
        const currentTime = new Date();
        const minTime = new Date(row.original.minTime);
        const maxTime = new Date(row.original.maxTime);

        if (currentTime > maxTime) {
            return  'bg-red-700';
        } else if (currentTime < minTime) {
            return 'bg-gray-500';
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
        link: "Link"
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
            cell: ({ row }) => {
                const date = new Date(row.getValue('minTime'));
                const formatted = date.toLocaleString();
                return (
                    <div>{formatted}</div>
                )
            }

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
            cell: ({ row }) => {
                const date = new Date(row.getValue('maxTime'));
                const formatted = date.toLocaleString();
                return (
                    <div>{formatted}</div>
                )
            }
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
            cell: ({ row }) => <div>{row.getValue("type")}</div>,
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
                const { sourceId, targetId, type, world } = row.original;
                let link = `https://${world}.plemiona.pl/game.php?village=${sourceId}&screen=place&target=${targetId}`;

                const catapultMatch = type.match(/Katapulty-(\d+)/);
                if (catapultMatch) {
                    const catapultCount = catapultMatch[1];
                    link += `&catapult=${catapultCount}`;
                }

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
                            {columnNames.link}
                        </Button>
                    </a>
                );
            },
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
            <div className="flex flex-wrap items-center py-4 gap-3">
                {deleted ? (
                    <Button
                        onClick={handleRestoreSelected}
                        variant="outline"
                        disabled={Object.keys(rowSelection).length === 0}
                    >
                        Przywróć
                    </Button>
                ) :
                (
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
                    className="max-w-sm"
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
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Pobieranie komend...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={getRowClasses(row)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Brak rozkazów.
                                    {error && <p className="text-red-500">{error}</p>}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} z{" "}
                    {table.getFilteredRowModel().rows.length} zaznaczonych wierszy
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Poprzednia
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Następna
                    </Button>
                </div>
            </div>
        </div>
    )
}
