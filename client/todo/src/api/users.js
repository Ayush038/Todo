import api from "./axios";

export const fetchUsers = async (search = "") => {
  const res = await api.get(`/users?search=${search}`);
  return res.data;
};