import api from "./api";

// Backend returns { data: { role, user } }. Merge role into the user object.
export const fetchCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  const userData = data?.data?.user;
  if (!userData) return null;
  return { ...userData, role: data.data.role ?? userData.role };
};
