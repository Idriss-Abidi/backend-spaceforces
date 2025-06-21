"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatDuration, getDifficultyColor } from "@/lib/utils";
import type { GetQuizzesResponse } from "@/services/getQuizzes";
import { getParticipantsByQuizId } from "@/services/getParticipantsByQuizId";
import { Award, Calendar, Clock, Info, Tag, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { Participation, User } from "@/types";

interface QuizStatusModalProps {
  quiz: GetQuizzesResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuizStatusModal({ quiz, open, onOpenChange }: QuizStatusModalProps) {
  const [participants, setParticipants] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState<string | null>(null);
  

  useEffect(() => {
    if (!quiz || !open) return;

    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const data = await getParticipantsByQuizId(quiz.id.toString());
        setParticipants(data);
      } catch (error) {
        toast.error("Error fetching participants");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [quiz, open, toast]);

  useEffect(() => {
    if (!quiz || !open) return;

    // Calculate time remaining for LIVE quizzes
    if (quiz.status === "LIVE") {
      const calculateTimeRemaining = () => {
        const startTime = new Date(quiz.startDateTime ?? "").getTime();
        const endTime = startTime + quiz.duration * 60 * 1000; // Convert minutes to milliseconds
        const now = new Date().getTime();
        const timeLeft = endTime - now;

        if (timeLeft <= 0) {
          setTimeRemaining("Quiz has ended");
          return false;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        setTimeRemaining(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
        return true;
      };

      if (calculateTimeRemaining()) {
        const timer = setInterval(() => {
          const shouldContinue = calculateTimeRemaining();
          if (!shouldContinue) {
            clearInterval(timer);
          }
        }, 1000);

        return () => clearInterval(timer);
      }
    }

    // Calculate time until start for CREATED quizzes
    if (quiz.status === "CREATED") {
      const calculateTimeUntilStart = () => {
        const startTime = new Date(quiz.startDateTime ?? "").getTime();
        const now = new Date().getTime();
        const timeUntil = startTime - now;

        if (timeUntil <= 0) {
          setTimeUntilStart("Quiz is starting now");
          return false;
        }

        const days = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntil % (1000 * 60)) / 1000);

        let timeString = "";
        if (days > 0) timeString += `${days}d `;
        timeString += `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;

        setTimeUntilStart(timeString);
        return true;
      };

      if (calculateTimeUntilStart()) {
        const timer = setInterval(() => {
          const shouldContinue = calculateTimeUntilStart();
          if (!shouldContinue) {
            clearInterval(timer);
          }
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [quiz, open]);

  if (!quiz) return null;

  // Sort participants by score (for FINISHED quizzes)
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  // Calculate progress percentage for LIVE quizzes
  const calculateProgress = () => {
    if (quiz.status !== "LIVE") return 100;

    const startTime = new Date(quiz.startDateTime ?? "").getTime();
    const endTime = startTime + quiz.duration * 60 * 1000;
    const now = new Date().getTime();

    if (now >= endTime) return 100;
    if (now <= startTime) return 0;

    return Math.floor(((now - startTime) / (endTime - startTime)) * 100);
  };

  // Helper function to get initials from username
  const getInitials = (user: User): string => {
    return user.username.substring(0, 2).toUpperCase();
  };

  // Helper function to determine participant status
  const getParticipantStatus = (participation: Participation): string => {
    const quizEndTime = new Date(quiz.startDateTime ?? "").getTime() + quiz.duration * 60 * 1000;
    const completionTime = new Date(participation.completionTime).getTime();

    if (quiz.status === "FINISHED") {
      return "Completed";
    }

    if (completionTime > 0) {
      return "Completed";
    }

    return "In Progress";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-[#2E0854] border-[#9370DB]/30 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty.diff)}>
              {quiz.difficulty.diff}
            </Badge>
            <Badge
              variant="outline"
              className={
                quiz.status === "LIVE"
                  ? "bg-green-500/30 text-green-200"
                  : quiz.status === "FINISHED"
                  ? "bg-blue-500/30 text-blue-200"
                  : "bg-[#4B0082]/30 text-white/90"
              }
            >
              {quiz.status === "LIVE" ? "LIVE NOW" : quiz.status === "FINISHED" ? "COMPLETED" : "UPCOMING"}
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold text-white">{quiz.title}</DialogTitle>
          <DialogDescription className="text-white/70">
            {quiz.description || "No description provided."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Common quiz info section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-4 w-4 text-[#9370DB]" />
              <span className="text-sm">Duration: {formatDuration(quiz.duration)}</span>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <Award className="h-4 w-4 text-[#9370DB]" />
              <span className="text-sm">Difficulty: {quiz.difficulty.diff}</span>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <Tag className="h-4 w-4 text-[#9370DB]" />
              <span className="text-sm">Topic: {quiz.topic || "General"}</span>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4 text-[#9370DB]" />
              <span className="text-sm">Mode: {quiz.mode}</span>
            </div>
          </div>

          {/* Status-specific content */}
          {quiz.status === "LIVE" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 p-3 rounded-md bg-[#4B0082]/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-white/90">Quiz in progress</span>
                  <span className="text-sm font-bold text-white">{timeRemaining}</span>
                </div>
                <Progress value={calculateProgress()} className="h-2 bg-[#9370DB]/20" />
              </div>

              <div className="border-t border-[#9370DB]/30 pt-4">
                <h3 className="text-sm font-medium mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-[#9370DB]" />
                  Current Participants ({loading ? "..." : participants.length})
                </h3>

                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full bg-[#9370DB]/20" />
                        <div className="space-y-1 flex-1">
                          <Skeleton className="h-4 w-24 bg-[#9370DB]/20" />
                          <Skeleton className="h-3 w-16 bg-[#9370DB]/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : participants.length > 0 ? (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-2 rounded-md bg-[#4B0082]/20">
                        <Avatar className="h-8 w-8 border border-[#9370DB]/30">
                          <AvatarFallback className="bg-[#6A0DAD] text-[#E6E6FA]">
                            {getInitials(participant.user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{participant.user.username}</p>
                          <p className="text-xs text-white/60">{getParticipantStatus(participant)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-white/60 italic">No participants yet. Be the first to join!</p>
                )}
              </div>
            </div>
          )}

          {quiz.status === "CREATED" && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-white/80 border-t border-[#9370DB]/30 pt-4">
                <Calendar className="h-4 w-4 text-[#9370DB] mt-0.5" />
                <div>
                  <span className="text-sm block">Starts: {formatDate(quiz.startDateTime)}</span>
                  <span className="text-xs text-purple-300 mt-1 block">Time until start: {timeUntilStart}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-white/80 bg-[#4B0082]/30 p-3 rounded-md">
                <Info className="h-4 w-4 text-[#9370DB] mt-0.5" />
                <div className="text-sm">
                  <p>This quiz hasn't started yet. You can join when it goes live.</p>
                  <p className="mt-1">Set a reminder to come back when the quiz begins!</p>
                </div>
              </div>
            </div>
          )}

          {quiz.status === "FINISHED" && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-white/80 border-t border-[#9370DB]/30 pt-4">
                <Trophy className="h-4 w-4 text-[#9370DB] mt-0.5" />
                <span className="text-sm font-medium">Final Standings</span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full bg-[#9370DB]/20" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-24 bg-[#9370DB]/20" />
                        <Skeleton className="h-3 w-16 bg-[#9370DB]/20" />
                      </div>
                      <Skeleton className="h-6 w-12 bg-[#9370DB]/20" />
                    </div>
                  ))}
                </div>
              ) : sortedParticipants.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {sortedParticipants.map((participant, index) => (
                    <div
                      key={participant.id}
                      className={`flex items-center gap-3 p-2 rounded-md ${
                        index === 0
                          ? "bg-yellow-500/20 border border-yellow-500/30"
                          : index === 1
                          ? "bg-gray-400/20 border border-gray-400/30"
                          : index === 2
                          ? "bg-amber-700/20 border border-amber-700/30"
                          : "bg-[#4B0082]/20"
                      }`}
                    >
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-[#6A0DAD]/50 text-xs font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8 border border-[#9370DB]/30">
                        <AvatarFallback className="bg-[#6A0DAD] text-[#E6E6FA]">
                          {getInitials(participant.user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.user.username}</p>
                        <p className="text-xs text-white/60">
                          Completed: {formatDate(new Date(participant.completionTime))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{participant.score} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/60 italic">No participants completed this quiz.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
          >
            Close
          </Button>

          {quiz.status === "LIVE" && (
            <Button className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]" asChild>
              <Link href={`/quiz/${quiz.id}/take`}>Take Quiz Now</Link>
            </Button>
          )}

          {quiz.status === "CREATED" && (
            <Button className="bg-[#6A0DAD]/70 hover:bg-[#6A0DAD]/50 text-[#E6E6FA]" disabled>
              Available Soon
            </Button>
          )}

          {quiz.status === "FINISHED" && (
            <Button className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]" asChild>
              <Link href={`/quiz/${quiz.id}/results`}>View Detailed Results</Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
