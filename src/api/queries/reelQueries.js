import axiosClient from "../client";

export const addReelAPi = async (payload) => {
  const { data } = await axiosClient.post(
    `/instructor/reel/upload-reel`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};

export const getAllReelAPi = async () => {
  const { data } = await axiosClient.get(`/instructor/reel/`);
  return data;
};
