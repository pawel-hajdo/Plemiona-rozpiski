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
import {loadLinksToOpenCount, loadPageSize, savePageSize} from "@/lib/utils";

export function CommandsTable({deleted}) {
    const [commands, setCommands] = useState([]);
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: 0,
        pageSize: loadPageSize(),
    })
    const [clickedRows, setClickedRows] = React.useState({});
    const [linksToOpenCount, setLinkToOpenCount] = React.useState(loadLinksToOpenCount);

    useEffect(() => {
        const fetchCommandsData = async () => {
            try {
                let data;
                if(deleted) {
                    data = await getDeletedCommands(698962117);
                } else {
                    data = await getPlayerCommands(698962117);
                }
                setCommands(data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchCommandsData();

    }, []);

    useEffect(() => {
        savePageSize(pagination.pageSize);
    }, [pagination.pageSize]);


    const openLinksInTabs = () => {
        const rows = table.getRowModel().rows;
        let openedCount = 0;
        rows.forEach((row, index) => {
            const rowId = row.id;
            const link = row.original.link;
            if (!clickedRows[rowId] && !isButtonDisabled(row) && openedCount < linksToOpenCount) {
                setTimeout(() => {
                    window.open(link, '_blank');
                    handleClickLink(rowId);
                }, openedCount * 150);
                openedCount++;
            }
        });

    };

    const handleClickLink = (rowId) => {
        setRowSelection((prev) => ({ ...prev, [rowId]: true }));
        setClickedRows((prev) => ({ ...prev, [rowId]: true }));
    };

    const isButtonDisabled = (row) => {
        const currentTime = new Date();
        const minTime = new Date(row.original.minTime);
        return currentTime < minTime;
    };

    const getRowClasses = (row) => {
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
            await softDeleteCommands(selectedCommands);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting commands:', error);
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
            await restoreCommands(selectedCommands);
            window.location.reload();
        } catch (error) {
            console.error('Error restoring commands:', error);
        }
    }

    const columns: ColumnDef<typeof commands[0]>[] = [
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
                    ID
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
                    minTime
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("minTime")}</div>,
        },
        {
            accessorKey: "maxTime",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    maxTime
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("maxTime")}</div>,
        },
        {
            accessorKey: "source",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    source
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("source")}</div>,
        },
        {
            accessorKey: "target",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    target
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("target")}</div>,
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    type
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div>{row.getValue("type")}</div>,
        },
        {
            accessorKey: "link",
            header: "Link",
            cell: ({ row }) => (
                <a
                    href={row.getValue("link")}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ pointerEvents: isButtonDisabled(row) || clickedRows[row.id] ? 'none' : 'auto' }}
                >
                    <Button
                        variant="outline"
                        onClick={()=>handleClickLink(row.id)}
                      //  disabled={isButtonDisabled(row) || clickedRows[row.id]}
                        style={{
                            backgroundColor: isButtonDisabled(row) || clickedRows[row.id] ? 'gray' : 'none',
                           // cursor: isButtonDisabled(row) || clickedRows[row.id] ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Link
                    </Button>
                </a>
            ),
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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
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
                        Restore
                    </Button>
                ) :
                (
                    <Button
                        onClick={handleDeleteSelected}
                        variant="outline"
                        disabled={Object.keys(rowSelection).length === 0}
                    >
                        Delete
                    </Button>
                )}
                <Select
                    value={pagination.pageSize.toString()}
                    onValueChange={(value) => setPagination({ ...pagination, pageSize: Number(value) })}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Number of commands" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="10">Show 10</SelectItem>
                            <SelectItem value="20">Show 20</SelectItem>
                            <SelectItem value="50">Show 50</SelectItem>
                            <SelectItem value="100">Show 100</SelectItem>
                            <SelectItem value={commands.length.toString()}>Show All</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button
                    onClick={openLinksInTabs}
                    variant={"outline"}
                >
                    Open {linksToOpenCount}
                </Button>
                <Input
                    placeholder="Filter type..."
                    value={(table.getColumn("type")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("type")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
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
                        {table.getRowModel().rows?.length ? (
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
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
