import axiosInstance from "./axiosInstance";

export const uploadImage = async (image: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", image);

  try {
    const response = await axiosInstance.post(`/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}