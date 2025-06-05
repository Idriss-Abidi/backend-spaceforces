import { Quiz } from "@/types";
import axiosInstance from "./axiosInstance";

export interface GetQuizzesResponse extends Omit<Quiz, "topic" | "createdAt" | "startDateTime"> {
  topic: string[];
  createdAt?: Date;
  startDateTime?: Date;
}

export const getQuizzes = async (): Promise<GetQuizzesResponse[]> => {
  try {
    const response = await axiosInstance.get<Quiz[]>(`/quizzes`);
    const transformedData = response.data.map((quiz) => ({
      ...quiz,
      topic: quiz.topic?.split(", ") || [],
      createdAt: quiz.createdAt ? new Date(quiz.createdAt) : undefined,
      startDateTime: quiz.startDateTime ? new Date(quiz.startDateTime) : undefined,
    }));

    return transformedData;
  } catch (error) {
    throw error;
  }
};
