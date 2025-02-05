import axiosClient from "../client";

export const fetchDepartmentsApi = async () => {
  const { data } = await axiosClient.get(`/common/departments`);
  return data;
};
