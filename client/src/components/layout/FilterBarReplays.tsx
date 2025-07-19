import { ChevronDownIcon as ChevronDown } from "@heroicons/react/24/solid"; // Using Heroicons directly for this one-off
import * as React from "react";

interface FilterBarReplaysProps {
  currentCategory?: string;
}

const FilterBarReplays: React.FC<FilterBarReplaysProps> = ({
  currentCategory,
}) => {
  const categories = [
    "Tất cả",
    "Sự kiện đặc biệt",
    "Bóng đá",
    "Tennis",
    "Bóng rổ",
    "eSports",
    "Đua xe",
    "Môn khác",
  ];

  const searchPlaceholder =
    currentCategory && currentCategory !== "Tất cả"
      ? `Tìm kiếm trong ${currentCategory}...`
      : "Tìm kiếm tên trận đấu, giải đấu, BLV...";

  return (
    <div className="my-4 rounded-lg shadow flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <div className="relative w-full sm:w-auto">
        <select
          className="appearance-none w-full sm:w-auto bg-slate-700 border border-slate-600 text-white text-sm rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500"
          aria-label="Filter by category"
          defaultValue={currentCategory || "Tất cả"}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      <div className="relative flex-grow w-full sm:w-auto">
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none"
          aria-label="Search replays"
        />
        {/* Magnifying glass icon could be added here */}
      </div>
      <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold py-2 px-4 rounded-md w-full sm:w-auto transition-colors">
        Tìm Kiếm
      </button>
    </div>
  );
};

export default FilterBarReplays;
