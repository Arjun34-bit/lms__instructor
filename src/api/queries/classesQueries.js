import axiosClient from "../client";

export const fetchLiveClassesApi = async (pageNumber = 1) => {
    const { data } = await axiosClient.get(
      `/instructor/live-class?pageNumber=${pageNumber}`
    );
    return data;
  };
  export const addLiveClassApi = async (classData) => {
    const { data } = await axiosClient.post("/instructor/live-class/schedule", classData);
    return data;
  };