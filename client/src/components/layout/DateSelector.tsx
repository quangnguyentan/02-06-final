import { DateTabInfo } from "@/types/match.types";
import { SparklesIcon } from "./Icon";
import * as React from "react";

interface DateSelectorProps {
  dates: DateTabInfo[];
  selectedDateId: string;
  onSelectDate: (dateId: string) => void;
  activeTabStyle?: "schedule" | "results"; // To differentiate styling if needed
}

const DateSelector: React.FC<DateSelectorProps> = ({
  dates,
  selectedDateId,
  onSelectDate,
  activeTabStyle = "schedule",
}) => {
  const getActiveClasses = () => {
    if (activeTabStyle === "results") {
      return "bg-current-color text-white shadow-md scale-100 text-xs"; // Match the orange-ish background from the screenshot
    }
    return "bg-current-color text-white shadow-md scale-105 text-xs";
  };

  const getInactiveClasses = () => {
    if (activeTabStyle === "results") {
      return "bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white text-xs";
    }
    return "bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white text-xs";
  };

  return (
    <div className="rounded-t-md">
      <div className="flex space-x-1 overflow-x-auto pb-1">
        {dates.map((dateTab) => (
          <button
            key={dateTab.id}
            onClick={() => onSelectDate(dateTab.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all duration-150 ease-in-out focus:outline-none flex items-center justify-center group
              ${
                selectedDateId === dateTab.id
                  ? getActiveClasses()
                  : getInactiveClasses()
              } ${
              activeTabStyle === "results" ? "min-w-[60px] text-center" : ""
            }`}
            aria-pressed={selectedDateId === dateTab.id}
          >
            {dateTab.hasLive &&
              activeTabStyle === "schedule" && ( // Show live icon only on schedule page
                <SparklesIcon
                  className={`w-4 h-4 mr-1.5 ${
                    selectedDateId === dateTab.id
                      ? "text-white"
                      : "text-red-400 group-hover:text-red-300"
                  }`}
                />
              )}
            {dateTab.id === "live" && dateTab.dateSuffix && (
              <span className="ml-1 text-xs text-red-400">
                {dateTab.dateSuffix}
              </span>
            )}
            <div className="flex flex-col items-center leading-tight">
              <span
                className={`${
                  selectedDateId === dateTab.id
                    ? activeTabStyle === "results"
                      ? "font-semibold"
                      : "font-semibold"
                    : "text-gray-400 group-hover:text-gray-200"
                }`}
              >
                {dateTab.label}
              </span>
              {dateTab.id !== "live" && (
                <span
                  className={`text-xs ${
                    selectedDateId === dateTab.id
                      ? activeTabStyle === "results"
                        ? "text-orange-100"
                        : "text-orange-100"
                      : "text-gray-500 group-hover:text-gray-300"
                  }`}
                >
                  {dateTab.dateSuffix}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateSelector;
