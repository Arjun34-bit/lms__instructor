import axiosClient from "../client";

export const fetchUserProfileData = async (userId) => {
  const { data } = await axiosClient.get(`/auth/users/${userId}`);
  return data;
};
