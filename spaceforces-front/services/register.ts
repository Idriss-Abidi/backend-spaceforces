import axiosInstance from "./axiosInstance";

type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  description?: string;
};

type RegisterResponse = {
  message: string;
  // Optionally add more fields if backend returns them (e.g., userId, token, etc.)
};

export const register = async ({
  username,
  email,
  password,
  description,
}: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await axiosInstance.post<RegisterResponse>(
      `/register`,
      {
        username,
        email,
        password,
        description,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
