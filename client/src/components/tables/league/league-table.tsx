// LeagueTable.tsx

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
import { getColumns } from "./columns"; // Import getColumns
import { useModal } from "@/hooks/use-model-store";
import { useSelectedPageContext } from "@/hooks/use-context";
import { apiGetAllLeagues } from "@/services/league.services";
import { apiGetAllSports } from "@/services/sport.services"; // Import sports API
import { League } from "@/types/league.types"; // Import League type
import { Sport } from "@/types/sport.types"; // Import Sport type
import { useMediaQuery, useTheme } from "@mui/material";

export function LeagueTable() {
  const { onOpen } = useModal();
  const { league, setLeague } = useSelectedPageContext();
  const [sports, setSports] = React.useState<Sport[]>([]); // State để lưu danh sách sports
  const theme = useTheme(); // Sử dụng theme từ MUI
  const isXs = useMediaQuery(theme.breakpoints.down("xs")); // < 600px
  const isSm = useMediaQuery(theme.breakpoints.between("xs", "sm")); // 600px - 899px
  const isMd = useMediaQuery(theme.breakpoints.between("sm", "md")); // 900px - 1199px
  const isLg = useMediaQuery(theme.breakpoints.between("md", "lg")); // 1200px - 1535px
  const isXl = useMediaQuery(theme.breakpoints.up("xl")); // >= 1536px

  // Đặt pageSize động dựa trên kích thước màn hình
  const [pageSize, setPageSize] = React.useState(
    isXs ? 3 : isSm ? 4 : isMd ? 5 : isLg ? 6 : isXl ? 8 : 8
  ); // Giá trị mặc định

  React.useEffect(() => {
    if (isXs) {
      setPageSize(3); // pageSize cho màn hình rất nhỏ
    } else if (isSm) {
      setPageSize(4); // pageSize cho màn hình nhỏ
    } else if (isMd) {
      setPageSize(5); // pageSize cho màn hình trung bình
    } else if (isLg) {
      setPageSize(6); // pageSize cho màn hình lớn
    } else if (isXl) {
      setPageSize(8); // pageSize cho màn hình rất lớn
    }
  }, [isXs, isSm, isMd, isLg, isXl]);
  // Chuyển sports vào getColumns
  const columns = React.useMemo(
    () => getColumns(onOpen, sports),
    [onOpen, sports]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: league,
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

  const fetchLeaguesAndSports = async () => {
    try {
      // Fetch all sports first
      const sportsRes = await apiGetAllSports();
      const allSports = sportsRes.data;
      setSports(allSports); // Cập nhật state sports

      // Fetch all leagues
      const leaguesRes = await apiGetAllLeagues();
      if (leaguesRes.data) {
        // Populate sport field for each league if it's just an ID
        const populatedLeagues: League[] = leaguesRes.data.map((l: League) => {
          if (typeof l.sport === "string") {
            const foundSport = allSports.find((s: Sport) => s._id === l.sport);
            // Replace with object or keep string if not found, or default to a dummy object
            return {
              ...l,
              sport: foundSport || {
                _id: l.sport,
                name: "Unknown Sport",
                slug: "unknown-sport",
                icon: "",
              },
            };
          }
          return l; // Already an object
        });
        setLeague(populatedLeagues);
      } else {
        console.log("Failed to fetch leagues");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error
    }
  };

  React.useEffect(() => {
    fetchLeaguesAndSports();
  }, []); // Run once on component mount

  return (
    <div className="w-full shadow-lg drop-shadow-lg ">
      <div className="flex items-center py-4 px-6 justify-between flex-col gap-2 sm:gap-0 sm:flex-row">
        <Input
          placeholder="Tìm kiếm theo tên giải đấu..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div
          onClick={() => onOpen("createLeague")}
          className="flex items-center space-x-2  w-full sm:w-auto"
        >
          <Button className="bg-blue-500 hover:bg-blue-700 text-white rounded-[4px] w-full">
            Thêm giải đấu
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
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table className="equal-widths">
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
                  );
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
  );
}
