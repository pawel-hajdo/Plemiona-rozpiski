import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {flexRender, HeaderGroup, RowData} from "@tanstack/react-table";

const TableContainer = ({ isLoading, error, columns, table, getRowClasses, handleClickLink }: any) => (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup:HeaderGroup<RowData>) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        ))}
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
                    table.getRowModel().rows.map((row: any) => (
                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className={getRowClasses(row)}>
                            {row.getVisibleCells().map((cell: any) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            Brak rozkazów.
                            {error && <p className="text-red-500">{error}</p>}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
);

export default TableContainer;
