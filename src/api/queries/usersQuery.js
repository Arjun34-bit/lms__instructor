import axiosClient from "../client";

export const fetchUserProfileData = async () => {
  const { data } = await axiosClient.get(`/instructor/user/profile`);
  return data;
};
