export const setLocalStorageUser = (user) => {
  localStorage.removeItem("user"); // Remove existing user
  localStorage.setItem("user", JSON.stringify(user));
};

export const getLocalStorageUser = () => {
  const user = localStorage.getItem("user");
  if (user) {
    return JSON.parse(user);
  }
  return null;
};

export const setAccessToken = (token) => {
  localStorage.setItem("token", token);
};

export const getAccessToken = () => {
  return localStorage.getItem("token");
};

export const getUserRole = () => {
  const user = getLocalStorageUser();
  if (!user || !user?.role) {
    return null;
  }
  return user?.role;
};

export const getUserId = () => {
  const user = getLocalStorageUser();
  if (!user || !user?.userId) {
    return null;
  }
  return user?.userId;
};
