import { Quiz, User } from '@/types';
import axiosInstance  from './axiosInstance';


interface Submission {
    questionId: number;
    optionId: number;
}

export interface CreateQuizSubmissionRequest {
    submissions: Submission[];
}

export interface CreateQuizSubmissionResponse {
    id: number;
    user: User;
    quiz: Quiz;
    score: number;
    completionTime: string;
}



export const createQuizSubmission = async (submissions: CreateQuizSubmissionRequest): Promise<CreateQuizSubmissionResponse> => {
    try {
      const response = await axiosInstance.post<CreateQuizSubmissionResponse>(`/submissions`, submissions);
      return response.data;
    } catch (error) {
      throw error;
    }
  };