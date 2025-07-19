// types/banner.types.ts
export interface Banner {
    _id?: string;
    imageUrl?: string;
    position?: "TOP" | "BOTTOM" | "SIDEBAR_LEFT" | "SIDEBAR_RIGHT" | "FOOTER" | "POPUP" | "INLINE";
    displayPage?: "ALL_PAGE" | "HOME_PAGE" | "SHEDULE_PAGE" | "RESULT_PAGE" | "REPLAY_PAGE" | "LIVE_PAGE" | "REPLAY_VIDEO_PAGE";
    link?: string;
    priority?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
}
