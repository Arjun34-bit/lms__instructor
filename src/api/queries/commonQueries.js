import axiosClient from "../client";

export const fetchDepartmentsApi = async () => {
  const { data } = await axiosClient.get(`/common/departments`);
  return data;
};

export const fetchAllMasterDataApi = async () => {
  const { data } = await axiosClient.get(`/common/master-data`);
  return data;
};

export const fetchSubjectsApi = async ({ departmentId }) => {
  const { data } = await axiosClient.get(
    `/common/subjects?` + departmentId || ""
  );
  return data;
};
