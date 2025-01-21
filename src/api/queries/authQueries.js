import axiosClient from "../client";

export const authLoginApi = async ({ email, password }) => {
  const { data } = await axiosClient.post("/auth/login", { email, password });
  return data;
};

export const authSignupApi = async ({
  name,
  email,
  password,
  phone_number,
  role,
  departments,
  subjects,
}) => {
  const { data } = await axiosClient.post("/auth/register", {
    name,
    email,
    password,
    phone_number,
    role,
    departments,
    subjects,
  });
  return data;
};
