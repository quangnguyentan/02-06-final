import axiosConfig from "../axios";
export const apiGetAllTeams = async () => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/teams/",
    });
    return response;
  } catch (error) {
    console.error("Error fetching all teams:", error);
    throw error;
  }
};
export const apiGetTeamById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "GET",
      url: "/teams/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error fetching team by ID:", error);
    throw error;
  }
};
export const apiDeleteTeamById = async (id: string) => {
  try {
    const response = await axiosConfig({
      method: "DELETE",
      url: "/teams/" + id,
    });
    return response;
  } catch (error) {
    console.error("Error deleting team by ID:", error);
    throw error;
  }
};
export const apiCreateTeam = async (data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "POST",
      url: "/teams/",
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current team:", error);
    throw error;
  }
};
export const apiUpdateTeam = async (id: string, data: FormData) => {
  try {
    const response = await axiosConfig({
      method: "PUT",
      url: "/teams/" + id,
      data,
    });
    return response;
  } catch (error) {
    console.log("Error fetching current team:", error);
    throw error;
  }
};
