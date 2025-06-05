import { Option } from "@/types";
import axiosInstance from "./axiosInstance";

export type GetOptionsRequest = string;

export type GetOptionsResponse = Option[];

export const getOptionsByQuestionId = async (questionId: GetOptionsRequest): Promise<GetOptionsResponse> => {
  try {
    const response = await axiosInstance.get<Option[]>(`/questions/${questionId}/options`);

    return response.data;
  } catch (error) {
    throw error;
  }
};
