import axiosConfig from "../axios";
export const apiGetAllMatches = async (matchIdCanBo?: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/matches/",
      params: {
        excludeId: matchIdCanBo,
        // status: 'ongoing',
        // sport: 'football'
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching all matches:", error);
    throw error;
  }
};
export const apiGetMatchById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/matches/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error fetching match by ID:", error);
    throw error;
  }
};
export const apiGetMatchBySlug = async (slug: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/matches/getMatch/" + slug,
    });
    return response;
  } catch (error) {
    console.error("Error fetching match by ID:", error);
    throw error;
  }
};
export const apiDeleteMatchById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "DELETE",
      url: "/matches/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting match by ID:", error);
    throw error;
  }
};
export const apiCreateMatch = async (data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/matches/",
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current match:", error);
    throw error;
  }
};
export const apiUpdateMatch = async (id: string, data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "PUT",
      url: "/matches/" + id,
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current match:", error);
    throw error;
  }
};
