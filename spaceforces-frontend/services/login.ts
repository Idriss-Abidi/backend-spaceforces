import axiosInstance from "./axiosInstance";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
  message: string;
};

export const login = async ({ email, password }: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<LoginResponse>(
      `/login`,
      {
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    localStorage.setItem("token", response.data.token);
    return response.data;
  } catch (error) {
    throw error;
  }
};
