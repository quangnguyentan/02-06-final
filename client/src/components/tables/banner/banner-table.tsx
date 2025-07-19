// banner-table.tsx
import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  ColumnMeta,
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBannerColumns } from "./columns";
import { useModal } from "@/hooks/use-model-store";
import { useSelectedPageContext } from "@/hooks/use-context";
import { apiGetAllBanners } from "@/services/banner.services";
import { Banner } from "@/types/banner.types";
import { useMediaQuery, useTheme } from "@mui/material";

interface CustomColumnMeta<TData, TValue> extends ColumnMeta<TData, TValue> {
  width?: string | number;
}

export function BannerTable() {
  const { onOpen } = useModal();
  const { banner, setBanner } = useSelectedPageContext();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));
  const isSm = useMediaQuery(theme.breakpoints.between("xs", "sm"));
  const isMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLg = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));

  const [pageSize, setPageSize] = React.useState(
    isXs ? 3 : isSm ? 4 : isMd ? 5 : isLg ? 6 : isXl ? 8 : 8
  );

  React.useEffect(() => {
    if (isXs) setPageSize(3);
    else if (isSm) setPageSize(4);
    else if (isMd) setPageSize(5);
    else if (isLg) setPageSize(6);
    else if (isXl) setPageSize(8);
  }, [isXs, isSm, isMd, isLg, isXl]);

  const columns = React.useMemo(
    () => getBannerColumns(onOpen) as ColumnDef<Banner, unknown>[],
    [onOpen]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: banner || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  const fetchBanners = async () => {
    try {
      const response = await apiGetAllBanners();
      setBanner(response.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  React.useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="w-full shadow-lg drop-shadow-lg bg-white rounded-lg">
      <div className="flex items-center py-4 px-6 justify-between flex-col gap-2 sm:gap-0 sm:flex-row">
        <Input
          placeholder="Tìm kiếm theo tiêu đề banner..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button
            onClick={() => onOpen("createBanner")}
            className="bg-blue-500 hover:bg-blue-700 text-white rounded-[4px] w-full"
          >
            Thêm banner
          </Button>
          <div className="sm:block hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column, index) => (
                    <DropdownMenuCheckboxItem
                      key={index}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="table-auto w-full">
          <TableHeader className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={index}>
                {headerGroup.headers.map((header, indexHeader) => (
                  <TableHead
                    key={indexHeader}
                    className="px-4 py-2 text-left font-medium whitespace-nowrap"
                    style={{
                      width: (
                        header.column.columnDef.meta as CustomColumnMeta<
                          Banner,
                          unknown
                        >
                      )?.width,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={index}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell, indexCell) => (
                    <TableCell
                      key={indexCell}
                      className="px-4 py-2 whitespace-nowrap"
                    >
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
                  Không có kết quả.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4 px-6">
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
  );
}
