import { Quiz } from "@/types";
import axiosInstance from "./axiosInstance";


export const getQuizzesByUserId = async (userId: number) => {
  try {
    const response = await axiosInstance.get<Quiz[]>(`/quizzes/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching quizzes by user ID:", error);
    throw error;
  }
}