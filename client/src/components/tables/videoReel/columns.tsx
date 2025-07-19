// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModalData, ModalType } from "@/hooks/use-model-store";
import { VideoReels } from "@/types/videoReel.type";
import { Sport } from "@/types/sport.types";
import { User } from "@/types/user.types";

export const getVideoReelsColumns = (
  onOpen: (type: ModalType, data?: ModalData) => void,
  sports: Sport[],
  users: User[]
): ColumnDef<VideoReels>[] => [
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
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tiêu đề
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("title")}</div>
    ),
  },
  {
    accessorKey: "slug",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Slug
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("slug")}</div>,
  },
  {
    accessorKey: "videoUrl",
    header: "Video",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.getValue("videoUrl") ? (
          <a
            href={row.getValue("videoUrl")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all !text-sm"
          >
            Xem video
          </a>
        ) : (
          "N/A"
        )}
      </div>
    ),
  },
  {
    accessorKey: "thumbnail",
    header: "Hình thu nhỏ",
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        {row.getValue("thumbnail") ? (
          <img
            src={row.getValue("thumbnail")}
            alt="Thumbnail"
            className="w-10 h-10 object-contain rounded"
          />
        ) : (
          "N/A"
        )}
      </div>
    ),
  },
  {
    accessorKey: "sport",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Môn thể thao
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const sportData = row.original.sport;
      let sportName = "N/A";
      if (
        typeof sportData === "object" &&
        sportData !== null &&
        "name" in sportData
      ) {
        sportName = (sportData as Sport).name ?? "N/A";
      } else if (typeof sportData === "string") {
        const foundSport = sports.find((s) => s._id === sportData);
        sportName = foundSport ? foundSport.name ?? "N/A" : "ID: " + sportData;
      }
      return <div className="capitalize">{sportName}</div>;
    },
  },
  {
    accessorKey: "commentator",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Bình luận viên
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const commentatorData = row.original.commentator;
      let commentatorName = "N/A";
      if (
        typeof commentatorData === "object" &&
        commentatorData !== null &&
        "username" in commentatorData
      ) {
        commentatorName = (commentatorData as User).username ?? "N/A";
      } else if (typeof commentatorData === "string") {
        const foundUser = users.find((u) => u._id === commentatorData);
        commentatorName = foundUser
          ? foundUser.username ?? "N/A"
          : "ID: " + commentatorData;
      }
      return <div className="capitalize">{commentatorName}</div>;
    },
  },
  {
    accessorKey: "views",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Lượt xem
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("views")}</div>,
  },
  {
    accessorKey: "duration",
    header: "Thời lượng (giây)",
    cell: ({ row }) => <div>{row.getValue("duration")}</div>,
  },
  {
    accessorKey: "publishDate",
    header: "Ngày xuất bản",
    cell: ({ row }) => {
      const publishDate = row.getValue("publishDate") as string;
      return publishDate ? (
        <div className="capitalize">
          {new Date(publishDate).toLocaleString("vi-VN", {
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
    accessorKey: "isFeatured",
    header: "Nổi bật",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("isFeatured") ? "Có" : "Không"}
      </div>
    ),
  },
  {
    accessorKey: "order",
    header: "Thứ tự hiển thị",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("order")}</div>
    ),
  },
  {
    id: "actions",
    header: "Hành động",
    enableHiding: false,
    cell: ({ row }) => {
      const videoReel = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpen("editVideoReel", { videoReel })}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[4px]"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onOpen("deleteVideoReel", { videoReel })}
            className="bg-red-500 hover:bg-red-700 text-white rounded-[4px]"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
