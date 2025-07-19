// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { ModalData, ModalType } from "@/hooks/use-model-store";
import { Team } from "@/types/team.types";
import { Sport } from "@/types/sport.types";

export const getColumns = (
  onOpen: (type: ModalType, data?: ModalData) => void,
  sports: Sport[] // <--- Thêm tham số sports
): ColumnDef<Team>[] => [
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
      // Kiểm tra nếu sport là object (đã populate)
      if (
        typeof sportData === "object" &&
        sportData !== null &&
        "name" in sportData
      ) {
        sportName = (sportData as Sport).name ?? "N/A";
      }
      // Nếu sport là string (ID), tìm trong mảng sports đã truyền vào
      else if (typeof sportData === "string") {
        const foundSport = sports.find((s) => s._id === sportData);
        sportName = foundSport ? foundSport.name ?? "N/A" : "ID: " + sportData;
      }
      return <div className="capitalize">{sportName}</div>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên đội bóng
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "slug",

    cell: ({ row }) => (
      <div className="lowercase px-4">{row.getValue("slug")}</div>
    ),
  },
  {
    accessorKey: "logo",
    header: "Ảnh đại diện",
    cell: ({ row }) => {
      const logoUrl = row.getValue("logo") as string;
      return logoUrl ? (
        <img
          src={logoUrl}
          alt="Team Logo"
          className="w-10 h-10 object-contain rounded-full" // Thay đổi kích thước và bo tròn nếu cần
        />
      ) : (
        "N/A"
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const team = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpen("editTeam", { team })}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[4px]"
          >
            <Edit className="h-4 w-4" /> {/* Thêm kích thước cho icon */}
          </Button>
          <Button
            onClick={() => onOpen("deleteTeam", { team })}
            className="bg-red-500 hover:bg-red-700 text-white rounded-[4px]"
          >
            <Trash className="h-4 w-4" /> {/* Thêm kích thước cho icon */}
          </Button>
        </div>
      );
    },
  },
];
