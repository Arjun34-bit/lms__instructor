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
