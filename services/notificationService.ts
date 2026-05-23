import api from "./api";

export const getNotifications = async (userId: number) => {
  const res = await api.get(
    `/notification-service/api/reminders/${userId}`
  );

  return res.data;
};

export const markNotificationRead = async (id: number) => {
  await api.put(
    `/notification-service/api/reminders/${id}/read`
  );
};