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

export const authLoginWithPhoneApi = async (idToken) => {
  const response = await axiosClient.post(`${process.env.REACT_APP_BACKEND_BASE_URL}/instructor/auth/login-with-phone-number`, {
    idToken
  });
  return response.data;
};
