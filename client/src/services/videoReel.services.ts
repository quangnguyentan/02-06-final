import axiosConfig from "../axios";

// VideoReels Services
export const apiGetAllVideoReels = async (filters?: { sport?: string; isFeatured?: boolean }) => {
    try {
        const response = await axiosConfig({
            method: "GET",
            url: "/video-reels/",
            params: filters,
        });
        return response;
    } catch (error) {
        console.error("Error fetching all video reels:", error);
        throw error;
    }
};

export const apiGetVideoReelsBySportSlug = async (sportSlug: string) => {
    try {
        const response = await axiosConfig({
            method: "GET",
            url: `/video-reels/sport/${sportSlug}`,
        });
        return response;
    } catch (error) {
        console.error("Error fetching video reels by sport slug:", error);
        throw error;
    }
};

export const apiGetVideoReelById = async (id: string) => {
    try {
        const response = await axiosConfig({
            method: "GET",
            url: `/video-reels/${id}`,
        });
        return response;
    } catch (error) {
        console.error("Error fetching video reel by ID:", error);
        throw error;
    }
};

export const apiGetVideoReelBySlug = async (slug: string) => {
    try {
        const response = await axiosConfig({
            method: "GET",
            url: `/video-reels/slug/${slug}`,
        });
        return response;
    } catch (error) {
        console.error("Error fetching video reel by slug:", error);
        throw error;
    }
};

export const apiCreateVideoReel = async (data: FormData) => {
    try {
        const response = await axiosConfig({
            method: "POST",
            url: "/video-reels/",
            data,
        });
        return response;
    } catch (error) {
        console.error("Error creating video reel:", error);
        throw error;
    }
};

export const apiUpdateVideoReel = async (id: string, data: FormData) => {
    try {
        const response = await axiosConfig({
            method: "PUT",
            url: `/video-reels/${id}`,
            data,
        });
        return response;
    } catch (error) {
        console.error("Error updating video reel:", error);
        throw error;
    }
};

export const apiDeleteVideoReelById = async (id: string) => {
    try {
        const response = await axiosConfig({
            method: "DELETE",
            url: `/video-reels/${id}`,
        });
        return response;
    } catch (error) {
        console.error("Error deleting video reel by ID:", error);
        throw error;
    }
};