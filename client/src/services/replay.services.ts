import axiosConfig from "../axios";
export const apiGetAllReplays = async (id?: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/replays/",
      params: {
        excludeId: id,
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching all replays:", error);
    throw error;
  }
};
export const apiGetReplayById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/replays/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error fetching replay by ID:", error);
    throw error;
  }
};
export const apiGetReplayBySlug = async (slug: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/replays/getReplay/" + slug,
    });
    return response;
  } catch (error) {
    console.error("Error fetching replay by ID:", error);
    throw error;
  }
};
export const apiDeleteReplayById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "DELETE",
      url: "/replays/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting replay by ID:", error);
    throw error;
  }
};
export const apiCreateReplay = async (data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/replays/",
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current replay:", error);
    throw error;
  }
};
export const apiUpdateReplay = async (id: string, data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "PUT",
      url: "/replays/" + id,
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current replay:", error);
    throw error;
  }
};
