import api from "../../../services/api";

// Update the currently authenticated donor's profile
export const updateMyDonorProfile = async (profileData) => {
  const response = await api.put("/me/update", profileData);
  return response.data;
};

export const bookDonationAppointment = (data) =>
  api.post("/appointments/new", data);

// Update donor profile visibility
export const updateDonorPrivacy = async (privacy) => {
  const response = await api.patch("/me/privacy", { privacy });
  return response.data;
};

// Delete the currently authenticated donor's account
export const deleteMyDonorAccount = async () => {
  const response = await api.delete("/me/delete");
  return response.data;
};
