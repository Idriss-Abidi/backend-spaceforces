import axiosInstance from "./axiosInstance";

export type DeleteQuizRequest = string;

export type DeleteQuizResponse = null;

export const deleteQuizById = async (quizId: DeleteQuizRequest): Promise<DeleteQuizResponse> => {
  try {
    const response = await axiosInstance.delete(`/quizzes/${quizId}`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
