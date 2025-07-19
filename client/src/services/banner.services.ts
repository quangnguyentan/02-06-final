import axiosConfig from "../axios";

// Banner Services
export const apiGetAllBanners = async (filters?: { position?: string; displayPage?: string; isActive?: boolean }) => {
    try {
        const response = await axiosConfig({
            method: "GET",
            url: "/banners/",
            params: filters,
        });
        return response;
    } catch (error) {
        console.error("Error fetching all banners:", error);
        throw error;
    }
};

export const apiGetBannersByDisplayPage = async (displayPage: string) => {
    try {
        const response = await axiosConfig({
            method: "GET",
            url: `/banners/display/${displayPage}`,
        });
        return response;
    } catch (error) {
        console.error("Error fetching banners by display page:", error);
        throw error;
    }
};

export const apiGetBannerById = async (id: string) => {
    try {
        const response = await axiosConfig({
            method: "GET",
            url: `/banners/${id}`,
        });
        return response;
    } catch (error) {
        console.error("Error fetching banner by ID:", error);
        throw error;
    }
};

export const apiCreateBanner = async (data: FormData) => {
    try {
        const response = await axiosConfig({
            method: "POST",
            url: "/banners/",
            data,
        });
        return response;
    } catch (error) {
        console.error("Error creating banner:", error);
        throw error;
    }
};

export const apiUpdateBanner = async (id: string, data: FormData) => {
    try {
        const response = await axiosConfig({
            method: "PUT",
            url: `/banners/${id}`,
            data,
        });
        return response;
    } catch (error) {
        console.error("Error updating banner:", error);
        throw error;
    }
};

export const apiDeleteBannerById = async (id: string) => {
    try {
        const response = await axiosConfig({
            method: "DELETE",
            url: `/banners/${id}`,
        });
        return response;
    } catch (error) {
        console.error("Error deleting banner by ID:", error);
        throw error;
    }
};