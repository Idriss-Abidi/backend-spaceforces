import { QuizDetails } from "@/types";
import axiosInstance from "./axiosInstance";

export type GetQuizDetailsRequest = string;

export type GetQuizDetailsResponse = QuizDetails;

export const getQuizDetails = async (quizId: GetQuizDetailsRequest): Promise<GetQuizDetailsResponse> => {
  try {
    const response = await axiosInstance.get<QuizDetails>(`/quizzes/${quizId}/details`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
