import slugify from "slugify";
import unidecode from "unidecode";

export function formatDuration(minutes: any) {
  const totalSeconds = Math.round(minutes * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${remainingMinutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${remainingMinutes}:${seconds.toString().padStart(2, "0")}`;
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
  });

export const formatDateFull = (date: Date): string => {
  const year = date.getUTCFullYear(); // Sử dụng UTC để tránh lệch múi giờ
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Tháng UTC
  const day = String(date.getUTCDate()).padStart(2, "0"); // Ngày UTC
  return `${year}-${month}-${day}`;
};

export const adjustToVietnamTime = (date: Date): Date => {
  const vietnamDate = new Date(date);
  vietnamDate.setUTCHours(vietnamDate.getUTCHours() + 7); // Điều chỉnh từ UTC sang UTC+07:00
  return vietnamDate;
};

export const createSlug = (name: string): string => {
  const asciiString = unidecode(name);
  return slugify(asciiString, {
    lower: true,
    strict: true,
    trim: true,
  });
};

// @/lib/helper.ts
export const setInitialLoadComplete = (value: boolean) => {
  localStorage.setItem("initialLoadComplete", value.toString());
};

export const isInitialLoadComplete = () => {
  return localStorage.getItem("initialLoadComplete") === "true";
};

export const resetInitialLoadComplete = () => {
  localStorage.removeItem("initialLoadComplete");
};
