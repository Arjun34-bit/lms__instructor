import axiosClient from "../client";

export const fetchAssignedCoursesApi = async (pageNumber = 1) => {
  const { data } = await axiosClient.get(
    `/instructor/course/assigned-courses?pageNumber=${pageNumber}`
  );
  return data;
};

export const fetchAssignedCoursesStatsApi = async () => {
  const { data } = await axiosClient.get(
    `/instructor/course/assigned-courses-stats`
  );
  return data;
};


export const addCourseApi = async (payload) => {
  const { data } = await axiosClient.post(
    `/instructor/course`,
    payload,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
}
export const getAllCoursesApi = async (pageNumber = 1) => {
  const { data } = await axiosClient.get(
    `/instructor/course/all-courses?pageNumber=${pageNumber}`
  );
  return data;
};
