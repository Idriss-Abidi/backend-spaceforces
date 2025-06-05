import axiosInstance from "./axiosInstance";
import { Participation } from "@/types";

export const getLeaderboard = async () => {
  try {
    const response = await axiosInstance.get<Participation[]>(`/participations`);
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};
