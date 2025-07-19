import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { ModalData, ModalType } from "@/hooks/use-model-store";
import { Sport } from "@/types/sport.types";
export const getColumns = (
  onOpen: (type: ModalType, data?: ModalData) => void
): ColumnDef<Sport>[] => [
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
    accessorKey: "name",
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
    cell: ({ row }) => (
      <div className="capitalize w-[150px] sm:w-auto">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "slug",

    cell: ({ row }) => (
      <div className="lowercase px-4">{row.getValue("slug")}</div>
    ),
  },

  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => {
      const iconUrl = row.getValue("icon") as string;
      return iconUrl ? (
        <img
          src={iconUrl}
          alt="Team Logo"
          className="w-6 h-6 object-contain rounded-full" // Thay đổi kích thước và bo tròn nếu cần
        />
      ) : (
        "N/A"
      );
    },
  },
  {
    accessorKey: "order",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-2 w-full"
        >
          Thứ tự hiển thị
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="px-4 text-center">{row.getValue("order")}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const sport = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpen("editSport", { sport })}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[4px]"
          >
            <Edit />
          </Button>
          <Button
            onClick={() => onOpen("deleteSport", { sport })}
            className="bg-red-500 hover:bg-red-700 text-white rounded-[4px]"
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];
