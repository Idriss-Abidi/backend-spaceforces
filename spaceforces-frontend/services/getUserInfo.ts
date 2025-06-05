import { User } from "@/types";
import axiosInstance from "./axiosInstance";

export type GetUserInfoRequest = string;

export type GetUserInfoResponse = User;

export const getUserInfo = async (token?: GetUserInfoRequest): Promise<GetUserInfoResponse> => {
  try {
    const response = await axiosInstance.get<User>(`/user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
