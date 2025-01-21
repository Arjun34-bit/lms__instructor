import axiosClient from "../client";

export const fetchUserSites = async () => {
    const { data } = await axiosClient.get("/api/users/sites");
    return data;
};

export const fetchUserProfile = async () => {
    const { data } = await axiosClient.get("/api/users/profile");
    return data;
}

export const fetchUserUpdates = async () => {
    const { data } = await axiosClient.get("/api/users/updates");
    return data;
}