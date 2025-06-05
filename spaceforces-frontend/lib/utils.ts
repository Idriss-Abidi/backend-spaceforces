import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString?: Date): string => {
  if (!dateString) return "N/A";
  if (typeof dateString === "string") {
    dateString = new Date(dateString);
  }
  return dateString.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false 
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getDifficultyColor = (difficultyId: string) => {
  switch (difficultyId) {
    case "Easy":
      return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    case "Intermediate":
      return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
    case "Hard":
      return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    case "Expert":
      return "bg-purple-300/10 text-purple-300 hover:bg-purple-300/20";
    default:
      return "bg-primary/10 text-primary hover:bg-primary/20";
  }
};

export const getStatusColor = (status?: string) => {
  switch (status) {
    case "LIVE":
      return "bg-green-500/10 text-green-500";
    case "FINISHED":
      return "bg-gray-500/10 text-gray-400";
    case "CREATED":
    default:
      return "bg-blue-500/10 text-blue-400";
  }
};
