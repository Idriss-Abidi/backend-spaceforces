import { Submission } from "@/types";
import axiosInstance from "./axiosInstance";

export type GetMySubmissionsByQuizRequest = string;

export type GetMySubmissionsByQuizResponse = Submission[]; 

export const getMySubmissionsByQuizId = async (quizId: GetMySubmissionsByQuizRequest): Promise<GetMySubmissionsByQuizResponse> => {
  try {
    const response = await axiosInstance.get<Submission[]>(`/submissions/quiz/${quizId}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
