import { API_BASE_URL } from '@/constants/api';

export const createAppointment = async (
  token: string,
  data: {
    specialistId: number;
    specialistType: 'VET' | 'SERVICE';
    petId: number;
    date: string;
    startTime: string;
  }
) => {
  const response = await fetch(
    `${API_BASE_URL}/appointment-service/appointments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
};

export const generateSlots = async (
  token: string,
  date: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/appointment-service/slots/generate?date=${date}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to load slots');
  }

  return response.json();
};

export const getSchedules = async (token: string) => {
  const response = await fetch(
    `${API_BASE_URL}/appointment-service/schedules`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
};

export const createSchedule = async (
  token: string,
  data: any
) => {
  const response = await fetch(
    `${API_BASE_URL}/appointment-service/schedules`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
};