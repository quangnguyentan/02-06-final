// columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ModalData, ModalType } from "@/hooks/use-model-store";
import { Match } from "@/types/match.types";
import { Team } from "@/types/team.types";
import { League } from "@/types/league.types";
import { Sport } from "@/types/sport.types";
import { User } from "@/types/user.types";
export const getColumns = (
  onOpen: (type: ModalType, data?: ModalData) => void,
  leagues: League[], // <--- Thêm tham số leagues
  teams: Team[], // <--- Thêm tham số teams
  sports: Sport[], // <--- Thêm tham số sports
  users: User[] // Add users parameter
): ColumnDef<Match>[] => [
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
    accessorKey: "homeTeam",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên đội nhà
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const teamData = row.original.homeTeam;
      let teamName = "N/A";
      if (
        typeof teamData === "object" &&
        teamData !== null &&
        "name" in teamData
      ) {
        teamName = (teamData as Team).name ?? "N/A";
      } else if (typeof teamData === "string") {
        const foundTeam = teams.find((t) => t._id === teamData);
        teamName = foundTeam ? foundTeam.name ?? "N/A" : "ID: " + teamData;
      }
      return <div className="capitalize">{teamName}</div>;
    },
  },
  {
    accessorKey: "scores",
    header: "Kết quả đội nhà",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.scores?.homeScore ?? "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "awayTeam",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên đội khách
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const teamData = row.original.awayTeam;
      let teamName = "N/A";
      if (
        typeof teamData === "object" &&
        teamData !== null &&
        "name" in teamData
      ) {
        teamName = (teamData as Team).name ?? "N/A";
      } else if (typeof teamData === "string") {
        const foundTeam = teams.find((t) => t._id === teamData);
        teamName = foundTeam ? foundTeam.name ?? "N/A" : "ID: " + teamData;
      }
      return <div className="capitalize">{teamName}</div>;
    },
  },
  {
    accessorKey: "scores",
    header: "Kết quả đội khách",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.original.scores?.awayScore ?? "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "league",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên giải đấu
          <ArrowUpDown />
        </Button>
      );
    },
    cell: ({ row }) => {
      const leagueData = row.original.league;
      let leagueName = "N/A";
      if (
        typeof leagueData === "object" &&
        leagueData !== null &&
        "name" in leagueData
      ) {
        leagueName = (leagueData as League).name ?? "N/A";
      } else if (typeof leagueData === "string") {
        const foundLeague = leagues.find((l) => l._id === leagueData);
        leagueName = foundLeague
          ? foundLeague.name ?? "N/A"
          : "ID: " + leagueData;
      }
      return <div className="capitalize">{leagueName}</div>;
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
      let sportName = "Không có môn thể thao";
      if (
        typeof sportData === "object" &&
        sportData !== null &&
        "name" in sportData
      ) {
        sportName = (sportData as Sport).name ?? "Không có môn thể thao";
      } else if (typeof sportData === "string") {
        const foundSport = sports.find((s) => s._id === sportData);
        sportName = foundSport
          ? foundSport.name ?? "Không có môn thể thao"
          : "ID: " + sportData;
      }
      return <div className="capitalize">{sportName}</div>;
    },
  },
  {
    accessorKey: "startTime",
    header: "Thời gian bắt đầu",
    // Định dạng lại thời gian nếu cần thiết, ví dụ:
    cell: ({ row }) => {
      const startTime = row.getValue("startTime") as string;
      const date = new Date(startTime);
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
      ); // Ví dụ định dạng
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("status") === "UPCOMING"
          ? "Sắp diễn ra"
          : row.getValue("status") === "LIVE"
          ? "Đang diễn ra"
          : row.getValue("status") === "FINISHED"
          ? "Đã kết thúc"
          : row.getValue("status") === "POSTPONED"
          ? "Trận đấu bị hoãn"
          : row.getValue("status") === "CANCELLED"
          ? "Trận đấu bị hủy"
          : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "isHot",
    header: "Trận đấu tâm điểm",
    cell: ({ row }) => {
      const sportData = row.original.sport;
      let sportName = "N/A";
      if (
        typeof sportData === "object" &&
        sportData !== null &&
        "name" in sportData
      ) {
        sportName = (sportData as Sport).name ?? "N/A";
      }
      return (
        <div className="capitalize">
          {row.getValue("isHot") === true
            ? `Trận đấu tâm điểm/${sportName}`
            : `Trận đấu ${sportName}`}
        </div>
      );
    },
  },

  {
    id: "streamLabel",
    header: "Tên luồng phát sóng",
    accessorFn: (row) =>
      row.streamLinks?.map((link) => link.label).join(", ") ||
      "Không có tên luồng phát sóng",
    cell: ({ getValue }) => (
      <div className="capitalize">{getValue() as string}</div>
    ),
  },
  {
    id: "commentator",
    header: "Bình luận viên",
    accessorFn: (row) =>
      row.streamLinks
        ?.map((link) => {
          if (typeof link.commentator === "object" && link.commentator?._id) {
            return link.commentator.username || "N/A";
          } else if (typeof link.commentator === "string") {
            const foundUser = users.find((u) => u._id === link.commentator);
            return foundUser ? foundUser.username : "ID: " + link.commentator;
          }
          return "N/A";
        })
        .join(", ") || "Không có bình luận viên",
    cell: ({ getValue }) => (
      <div className="capitalize">{getValue() as string}</div>
    ),
  },
  {
    id: "commentatorImage",
    header: "Ảnh bình luận viên",
    accessorFn: (row) =>
      row.streamLinks?.map((link) => link.commentatorImage).join(", ") ||
      "Không có ảnh bình luận viên",
    cell: ({ getValue }) => {
      return getValue() !== "Không có ảnh bình luận viên" ? (
        <div className="flex items-center justify-center">
          <img
            src={getValue() as string}
            alt="Ảnh bình luận viên"
            className="w-10 h-10 object-contain rounded-full " // Thay đổi kích thước và bo tròn nếu cần
          />
        </div>
      ) : (
        "Không có ảnh bình luận viên"
      );
    },
  },
  {
    id: "streamUrl",
    header: "Đường dẫn luồng phát sóng",
    accessorFn: (row) =>
      row.streamLinks?.map((link) => link.url).join(", ") ||
      "Không có đường dẫn luồng phát sóng",
    cell: ({ row }) => {
      const streamLinks = row.original.streamLinks;
      if (!streamLinks || streamLinks?.length === 0) {
        return (
          <div className="text-gray-500">
            Không có đường dẫn luồng phát sóng
          </div>
        );
      }
      return (
        <div className="flex flex-wrap gap-1">
          {streamLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all !text-sm" // break-all để ngắt dòng URL dài
            >
              {link.label || link.url}
            </a>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const match = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onOpen("editMatch", { match })}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-[4px]"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onOpen("deleteMatch", { match })}
            className="bg-red-500 hover:bg-red-700 text-white rounded-[4px]"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
