import axiosClient from "../client";

export const addLessionApi = async (payload) => {
  try {
    const { data } = await axiosClient.post(`/instructor/lesson`, payload);
    return data;
  } catch (error) {
    console.log(error);
  }
};
