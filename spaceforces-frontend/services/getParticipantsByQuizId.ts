import axiosInstance from "./axiosInstance";
import { Participation } from '@/types';

export const getParticipantsByQuizId = async (quizId: string) => {
  try {
    const response = await axiosInstance.get<Participation[]>(`/participations/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching participants:", error);
    throw error;
  }
};
