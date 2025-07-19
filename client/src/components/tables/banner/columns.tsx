// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModalData, ModalType } from "@/hooks/use-model-store";
import { Banner } from "@/types/banner.types";

export const getBannerColumns = (
  onOpen: (type: ModalType, data?: ModalData) => void
): ColumnDef<Banner>[] => [
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
    accessorKey: "imageUrl",
    header: "Hình ảnh",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.getValue("imageUrl") ? (
          <img
            src={row.getValue("imageUrl")}
            alt="Banner"
            className="w-10 h-10 object-contain rounded"
          />
        ) : (
          "N/A"
        )}
      </div>
    ),
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Vị trí
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const position = row.getValue("position") as string;
      return (
        <div className="capitalize">
          {position === "TOP"
            ? "Trên cùng"
            : position === "BOTTOM"
            ? "Dưới cùng"
            : position === "SIDEBAR_LEFT"
            ? "Thanh bên trái"
            : position === "SIDEBAR_RIGHT"
            ? "Thanh bên phải"
            : position === "FOOTER"
            ? "Chân trang"
            : position === "POPUP"
            ? "Cửa sổ bật lên"
            : position === "INLINE"
            ? "Trong dòng"
            : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "displayPage",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Trang hiển thị
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const displayPage = row.getValue("displayPage") as string;
      return (
        <div className="capitalize">
          {displayPage === "HOME_PAGE"
            ? "Trang chủ"
            : displayPage === "SHEDULE_PAGE"
            ? "Trang lịch thi đấu"
            : displayPage === "RESULT_PAGE"
            ? "Trang kết quả"
            : displayPage === "REPLAY_PAGE"
            ? "Trang phát lại"
            : displayPage === "LIVE_PAGE"
            ? "Trang trực tiếp"
            : displayPage === "REPLAY_VIDEO_PAGE"
            ? "Trang video phát lại"
            : displayPage === "ALL_PAGE"
            ? "Hiển thị mọi trang"
            : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Độ ưu tiên
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("priority")}</div>,
  },
  {
    accessorKey: "isActive",
    header: "Trạng thái",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("isActive") ? "Hoạt động" : "Không hoạt động Offline"}
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: "Ngày bắt đầu",
    cell: ({ row }) => {
      const startDate = row.getValue("startDate") as string;
      return startDate ? (
        <div className="capitalize">
          {new Date(startDate).toLocaleString("vi-VN", {
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
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "Ngày kết thúc",
    cell: ({ row }) => {
      const endDate = row.getValue("endDate") as string;
      return endDate ? (
        <div className="capitalize">
          {new Date(endDate).toLocaleString("vi-VN", {
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
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "link",
    header: "Liên kết",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("link") ? (
          <a
            href={row.getValue("link")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all !text-sm"
          >
            {row.getValue("link")}
          </a>
        ) : (
          "N/A"
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    enableHiding: false,
    cell: ({ row }) => {
      const banner = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpen("editBanner", { banner })}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[4px]"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onOpen("deleteBanner", { banner })}
            className="bg-red-500 hover:bg-red-700 text-white rounded-[4px]"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
