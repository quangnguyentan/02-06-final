// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModalData, ModalType } from "@/hooks/use-model-store";
import { Match } from "@/types/match.types";

import { Replay } from "@/types/replay.types";
import { Sport } from "@/types/sport.types";

export const getColumns = (
  onOpen: (type: ModalType, data?: ModalData) => void, // <--- Đã sửa lỗi ở đây
  matches: Match[],
  sports: Sport[] // <--- Thêm tham số sports
): ColumnDef<Replay>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
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
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tiêu đề
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <div className="max-w-xs truncate">{row.getValue("description")}</div> // Thêm truncate cho mô tả dài
    ),
  },
  {
    accessorKey: "videoUrl",
    header: "Video URL",
    cell: ({ row }) => {
      const url = row.getValue("videoUrl") as string;
      return url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all !text-sm"
        >
          {url}
        </a>
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "thumbnail",
    header: "Ảnh đại diện",
    cell: ({ row }) => {
      const thumbnailUrl = row.getValue("thumbnail") as string;
      return thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Thumbnail"
          className="w-16 h-9 object-cover rounded-sm"
        />
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "match",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Trận đấu
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const matchData = row.original.match;
      let matchTitle = "N/A";
      if (
        typeof matchData === "object" &&
        matchData !== null &&
        "title" in matchData
      ) {
        matchTitle = (matchData as Match).title ?? "N/A";
      } else if (typeof matchData === "string") {
        const foundMatch = matches.find((m) => m._id === matchData);
        matchTitle = foundMatch
          ? foundMatch.title ?? "N/A"
          : "ID: " + matchData;
      }
      return <div className="capitalize">{matchTitle}</div>;
    },
  },
  {
    accessorKey: "sport",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Môn thể thao
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const sportData = row.original.sport;
      let sportName = "N/A";
      if (
        typeof sportData === "object" &&
        sportData !== null &&
        "name" in sportData
      ) {
        sportName = (sportData as Sport)?.name ?? "N/A";
      } else if (typeof sportData === "string") {
        const foundMatch = sports.find((m) => m._id === sportData);
        sportName = foundMatch ? foundMatch?.name ?? "N/A" : "ID: " + sportData;
      }
      return <div className="capitalize">{sportName}</div>;
    },
  },
  {
    accessorKey: "isShown",
    header: "Hiển thị trang chủ",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("isShown") === true ? "Có" : "Không"}
      </div>
    ),
  },

  {
    accessorKey: "duration",
    header: "Thời lượng video (s)", // Thêm đơn vị nếu cần
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("duration")}</div>
    ),
  },
  {
    accessorKey: "publishDate",
    header: "Ngày xuất bản",
    // Định dạng lại thời gian nếu cần thiết, ví dụ:
    cell: ({ row }) => {
      const pushlistDate = row.getValue("publishDate") as string;
      const date = new Date(pushlistDate);
      return (
        <div className="capitalize">
          {date?.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Ho_Chi_Minh",
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "views",
    header: "Lượt xem",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("views")}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const replay = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpen("editReplay", { replay })}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[4px]"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onOpen("deleteReplay", { replay })}
            className="bg-red-500 hover:bg-red-700 text-white rounded-[4px]"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
