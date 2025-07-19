// ReplayTable.tsx
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
import { getColumns } from "./columns"; // Import getColumns
import { useModal } from "@/hooks/use-model-store";
import { useSelectedPageContext } from "@/hooks/use-context";
import { apiGetAllReplays } from "@/services/replay.services";
import { apiGetAllMatches } from "@/services/match.services"; // Import Match API
import { Replay } from "@/types/replay.types";
import { Match } from "@/types/match.types"; // Import Match type
import { Sport } from "@/types/sport.types";
import { apiGetAllSports } from "@/services/sport.services";
import { useMediaQuery, useTheme } from "@mui/material";
interface CustomColumnMeta<TData, TValue> extends ColumnMeta<TData, TValue> {
  width?: string | number;
}

export function ReplayTable() {
  const { onOpen } = useModal();
  const { replay, setReplay } = useSelectedPageContext();
  const [matches, setMatches] = React.useState<Match[]>([]); // State để lưu danh sách matches
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
  // Chuyển onOpen và matches vào getColumns
  const columns = React.useMemo(
    () => getColumns(onOpen, matches, sports) as ColumnDef<Replay, unknown>[],
    [onOpen, matches, sports]
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: replay,
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
  const fetchReplayRelatedData = async () => {
    try {
      // 1. Fetch all matches and replays concurrently
      const [matchesRes, replaysRes, sportsRes] = await Promise.all([
        apiGetAllMatches(),
        apiGetAllReplays(),
        apiGetAllSports(),
      ]);

      const allMatches = matchesRes.data || [];
      const fetchedReplays = replaysRes.data || [];
      const allSports = sportsRes.data || [];
      setMatches(allMatches); // Cập nhật state matches
      setSports(allSports);
      // 2. Populate match field for each replay if it's just an ID
      const populatedReplays: Replay[] = fetchedReplays.map((r: Replay) => {
        const populatedReplay = { ...r };

        // Populate match
        if (typeof populatedReplay.match === "string") {
          const foundMatch = allMatches.find(
            (m: Match) => m._id === populatedReplay.match
          );
          // Cần một object Match đầy đủ cho fallback nếu không tìm thấy
          // Tạm thời tạo một object Match giả định, bạn có thể cần chỉnh sửa lại Match type
          // để nó có thể chấp nhận một cấu trúc đơn giản hơn hoặc đảm bảo API luôn trả về object đầy đủ.
          populatedReplay.match = foundMatch || {
            _id: populatedReplay.match,
            title: "Unknown Match",
            slug: "unknown-match",
            homeTeam: { _id: "", name: "Unknown", slug: "", logo: "" }, // Placeholder
            awayTeam: { _id: "", name: "Unknown", slug: "", logo: "" }, // Placeholder
            league: { _id: "", name: "Unknown", slug: "", logo: "" }, // Placeholder
            sport: { _id: "", name: "Unknown", slug: "", icon: "" }, // Placeholder
            scores: { homeScore: 0, awayScore: 0 },
            startTime: new Date(),
            status: "unknown",
            streamLinks: [],
            thumbnail: "",
          };
        }
        return populatedReplay;
      });
      setReplay(populatedReplays); // Cập nhật state replay với dữ liệu đã populate
    } catch (error) {
      console.error("Error fetching replay related data:", error);
    }
  };

  React.useEffect(() => {
    fetchReplayRelatedData();
  }, []); // Chạy một lần khi component mount

  return (
    <div className="w-full shadow-lg drop-shadow-lg bg-white rounded-lg">
      <div className="flex items-center py-4 px-6 justify-between  flex-col gap-2 sm:gap-0 sm:flex-row">
        <Input
          placeholder="Tìm kiếm theo tiêu đề phát lại..."
          value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button
            onClick={() => onOpen("createReplay")}
            className="bg-blue-500 hover:bg-blue-700 text-white rounded-[4px] w-full"
          >
            Tạo phát lại
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
                  .map((column) => (
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
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="table-auto w-full">
          <TableHeader className="bg-gray-50 sticky top-0">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-2 text-left font-medium whitespace-nowrap"
                    style={{
                      width: (
                        header.column.columnDef.meta as CustomColumnMeta<
                          Replay,
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
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
                  No results.
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
