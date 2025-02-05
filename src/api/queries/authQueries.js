import axiosClient from "../client";

export const authLoginApi = async ({ email, password, rememberMe }) => {
  const { data } = await axiosClient.post("/instructor/auth/login", {
    email,
    password,
    rememberMe,
  });
  return data;
};

export const authRegisterApi = async ({
  name,
  email,
  password,
  phoneNumber,
  departmentId
}) => {
  const { data } = await axiosClient.post("/instructor/auth/signup", {
    name,
    email,
    password,
    phoneNumber,
    departmentId
  });
  return data;
};

export const googleSigninApi = async (idToken) => {
  const { data } = await axiosClient.post("/instructor/auth/google-login", {
    idToken,
  });
  return data;
};
