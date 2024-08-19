import React from "react";
import {Button} from "@/components/ui/button";

const PaginationControls = ({ table }: any) => (
    <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} z {table.getFilteredRowModel().rows.length} zaznaczonych wierszy
        </div>
        <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                Poprzednia
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Następna
            </Button>
        </div>
    </div>
);

export default PaginationControls
