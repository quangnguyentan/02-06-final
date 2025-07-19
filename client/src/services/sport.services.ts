import axiosConfig from "../axios";
export const apiGetAllSports = async () => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/sports/",
    });
    return response;
  } catch (error) {
    console.error("Error fetching all sports:", error);
    throw error;
  }
};
export const apiGetSportById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/sports/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error fetching sport by ID:", error);
    throw error;
  }
};
export const apiDeleteSportById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "DELETE",
      url: "/sports/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting sport by ID:", error);
    throw error;
  }
};
export const apiCreateSport = async (data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/sports/",
      data,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response;
  } catch (error) {
    console.log("Error fetching current sport:", error);
    throw error;
  }
};
export const apiUpdateSport = async (id: string, data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "PUT",
      url: "/sports/" + id,
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current sport:", error);
    throw error;
  }
};
