"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getQuizInfoById } from "@/services/getQuizInfoById";
import { getParticipantsByQuizId } from "@/services/getParticipantsByQuizId";
import { getQuizDetails } from "@/services/getQuizDetails";
import { formatDate, formatDuration, getDifficultyColor } from "@/lib/utils";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  Clock,
  Download,
  Medal,
  Share2,
  Tag,
  Trophy,
  Users,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Participation, Quiz, QuizDetails } from "@/types";
import Link from "next/link";

interface PageParams {
  quizId: string;
}

export default function QuizResultsPage({ params }: { params: PageParams }) {
  const quizId = params.quizId;
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
  const [participants, setParticipants] = useState<Participation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);

        // Fetch quiz information
        const quizData = await getQuizInfoById(quizId);
        setQuiz(quizData);

        // Fetch quiz details with questions
        const quizDetailsData = await getQuizDetails(quizId);
        setQuizDetails(quizDetailsData);

        // Fetch participants
        const participantsData = await getParticipantsByQuizId(quizId);
        setParticipants(participantsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError("Failed to load quiz results. Please try again.");
        setLoading(false);
        toast.error("Failed to load quiz results. Please try again.");
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Sort participants by score
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);

  // Calculate average score
  const averageScore =
    participants.length > 0
      ? participants.reduce((sum, p) => sum + p.score, 0) / participants.length
      : 0;

  // Calculate highest and lowest scores
  const highestScore = participants.length > 0 ? Math.max(...participants.map((p) => p.score)) : 0;

  const lowestScore = participants.length > 0 ? Math.min(...participants.map((p) => p.score)) : 0;

  // Calculate score distribution
  const calculateScoreDistribution = () => {
    if (participants.length === 0) return [];

    // Create score ranges (0-20, 21-40, 41-60, 61-80, 81-100)
    const ranges = [
      { label: "0-20%", count: 0, color: "bg-red-500" },
      { label: "21-40%", count: 0, color: "bg-orange-500" },
      { label: "41-60%", count: 0, color: "bg-yellow-500" },
      { label: "61-80%", count: 0, color: "bg-green-500" },
      { label: "81-100%", count: 0, color: "bg-emerald-500" },
    ];

    // Calculate max possible score (assuming it's 100 per question)
    const maxPossibleScore = 100;

    // Count participants in each range
    participants.forEach((p) => {
      const scorePercentage = (p.score / maxPossibleScore) * 100;
      if (scorePercentage <= 20) ranges[0].count++;
      else if (scorePercentage <= 40) ranges[1].count++;
      else if (scorePercentage <= 60) ranges[2].count++;
      else if (scorePercentage <= 80) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  };

  const scoreDistribution = calculateScoreDistribution();

  // Helper function to get initials from username
  const getInitials = (username: string): string => {
    return username.substring(0, 2).toUpperCase();
  };

  // Helper function to get medal color based on position
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "text-yellow-400"; // Gold
      case 2:
        return "text-gray-300"; // Silver
      case 3:
        return "text-amber-700"; // Bronze
      default:
        return "text-white/70";
    }
  };

  // Helper function to get background color based on position
  const getPositionBackground = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500/20 border-yellow-500/30";
      case 2:
        return "bg-gray-400/20 border-gray-400/30";
      case 3:
        return "bg-amber-700/20 border-amber-700/30";
      default:
        return "bg-[#4B0082]/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#9370DB] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-white/70">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white flex items-center justify-center">
        <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">Error Loading Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-center">{error || "Failed to load quiz results."}</p>
          </CardContent>
          <div className="flex justify-center p-6">
            <Button
              variant="default"
              className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button and header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-white hover:bg-[#4B0082]/20 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">{quiz.title}</h1>
              <p className="text-white/70">{quiz.description || "No description provided."}</p>
            </div>
          </div>
        </div>

        {/* Quiz info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-white">
                <Calendar className="mr-2 h-5 w-5 text-[#9370DB]" />
                Quiz Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="h-4 w-4 text-[#9370DB]" />
                  <span className="text-sm">Duration: {formatDuration(quiz.duration)}</span>
                </div>

                <div className="flex items-center gap-2 text-white/80">
                  <Badge variant="outline" className={getDifficultyColor(quiz.difficulty.diff)}>
                    {quiz.difficulty.diff}
                  </Badge>
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

              <div className="pt-2 border-t border-[#9370DB]/30">
                <div className="flex items-center gap-2 text-white/80">
                  <Calendar className="h-4 w-4 text-[#9370DB]" />
                  <span className="text-sm">
                    Created: {formatDate(new Date(quiz.createdAt || ""))}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white/80 mt-1">
                  <Calendar className="h-4 w-4 text-[#9370DB]" />
                  <span className="text-sm">
                    Started: {formatDate(new Date(quiz.startDateTime || ""))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-white">
                <Trophy className="mr-2 h-5 w-5 text-[#9370DB]" />
                Participation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-white/70">Total Participants</p>
                  <p className="text-2xl font-bold text-[#E6E6FA]">{participants.length}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-white/70">Average Score</p>
                  <p className="text-2xl font-bold text-[#E6E6FA]">{Math.round(averageScore)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-white/70">Highest Score</p>
                  <p className="text-2xl font-bold text-green-400">{highestScore}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-white/70">Lowest Score</p>
                  <p className="text-2xl font-bold text-red-400">{lowestScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-white">
                <Award className="mr-2 h-5 w-5 text-[#9370DB]" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedParticipants.slice(0, 3).map((participant, index) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#4B0082]/50 ${getMedalColor(
                          index + 1
                        )}`}
                      >
                        <Medal className="h-3.5 w-3.5" />
                      </div>
                      <div className="font-medium text-white">{participant.user.username}</div>
                    </div>
                    <div className="font-bold text-[#E6E6FA]">{participant.score}</div>
                  </div>
                ))}

                {participants.length === 0 && (
                  <p className="text-white/60 text-center py-2">No participants yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList className="bg-[#4B0082]/30 border border-[#9370DB]/30">
            <TabsTrigger
              value="leaderboard"
              className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
            >
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
            >
              Questions & Answers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Quiz Leaderboard</CardTitle>
                <CardDescription className="text-white/70">
                  {participants.length} participants ranked by score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participants.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {sortedParticipants.map((participant, index) => (
                      <div
                        key={participant.id}
                        className={`flex items-center gap-3 p-3 rounded-md border ${getPositionBackground(
                          index + 1
                        )}`}
                      >
                        <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[#6A0DAD]/50 text-sm font-bold">
                          {index + 1}
                        </div>
                        <Avatar className="h-8 w-8 border border-[#9370DB]/30">
                          <AvatarFallback className="bg-[#6A0DAD] text-[#E6E6FA]">
                            {getInitials(participant.user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-white">{participant.user.username}</p>
                          <p className="text-xs text-white/60">
                            Completed: {formatDate(new Date(participant.completionTime))}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#E6E6FA]">{participant.score}</p>
                          <p className="text-xs text-white/60">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Trophy className="h-12 w-12 text-[#9370DB]/50 mb-4" />
                    <p className="text-white/70 text-center">
                      No participants have completed this quiz yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white">Score Distribution</CardTitle>
                <CardDescription className="text-white/70">
                  How participants performed across different score ranges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participants.length > 0 ? (
                  <div className="space-y-4">
                    {scoreDistribution.map((range, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white">{range.label}</span>
                          <span className="text-white/70">
                            {range.count} participant{range.count !== 1 ? "s" : ""}
                            {participants.length > 0 &&
                              ` (${Math.round((range.count / participants.length) * 100)}%)`}
                          </span>
                        </div>
                        <div className="h-2 bg-[#4B0082]/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${range.color}`}
                            style={{
                              width: `${
                                participants.length > 0
                                  ? (range.count / participants.length) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-[#9370DB]/30 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5 text-[#9370DB]" />
                        <h3 className="text-lg font-medium text-white">Score Summary</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-white/70">Average Score</p>
                          <p className="text-2xl font-bold text-[#E6E6FA]">
                            {Math.round(averageScore)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-white/70">Median Score</p>
                          <p className="text-2xl font-bold text-[#E6E6FA]">
                            {participants.length > 0
                              ? participants.map((p) => p.score).sort((a, b) => a - b)[
                                  Math.floor(participants.length / 2)
                                ]
                              : 0}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-white/70">Standard Deviation</p>
                          <p className="text-2xl font-bold text-[#E6E6FA]">
                            {participants.length > 0
                              ? Math.round(
                                  Math.sqrt(
                                    participants
                                      .map((p) => Math.pow(p.score - averageScore, 2))
                                      .reduce((sum, val) => sum + val, 0) / participants.length
                                  )
                                )
                              : 0}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-white/70">Pass Rate</p>
                          <p className="text-2xl font-bold text-[#E6E6FA]">
                            {participants.length > 0
                              ? `${Math.round(
                                  (participants.filter((p) => p.score >= 60).length /
                                    participants.length) *
                                    100
                                )}%`
                              : "0%"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <BarChart3 className="h-12 w-12 text-[#9370DB]/50 mb-4" />
                    <p className="text-white/70 text-center">
                      No data available for statistics yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-[#9370DB]" />
                  Questions & Correct Answers
                </CardTitle>
                <CardDescription className="text-white/70">
                  Review all questions from this quiz with their correct answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {quizDetails?.questions && quizDetails.questions.length > 0 ? (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                    {quizDetails.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-4 rounded-lg border border-[#9370DB]/20 bg-[#4B0082]/10"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#6A0DAD]/50 text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-white mb-2">
                              {question.questionText}
                            </h3>
                            {question.imageUrl && (
                              <div className="mb-3">
                                <img
                                  src={question.imageUrl}
                                  alt="Question image"
                                  className="max-w-md rounded-lg border border-[#9370DB]/30"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                              <span>Points: {question.points}</span>
                              {question.tags && <span>Tags: {question.tags}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="ml-11 space-y-2">
                          <h4 className="text-sm font-medium text-white/80 mb-2">Answer Options:</h4>
                          {question.options.map((option) => (
                            <div
                              key={option.id}
                              className={`flex items-center gap-3 p-3 rounded-md border ${
                                option.valid
                                  ? "border-green-500/50 bg-green-500/10"
                                  : "border-[#9370DB]/20 bg-[#4B0082]/5"
                              }`}
                            >
                              {option.valid ? (
                                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-400/50 flex-shrink-0" />
                              )}
                              <span
                                className={`text-sm ${
                                  option.valid ? "text-green-100 font-medium" : "text-white/70"
                                }`}
                              >
                                {option.optionText}
                              </span>
                              {option.valid && (
                                <Badge
                                  variant="outline"
                                  className="ml-auto text-xs bg-green-500/20 text-green-300 border-green-500/30"
                                >
                                  Correct Answer
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <FileText className="h-12 w-12 text-[#9370DB]/50 mb-4" />
                    <p className="text-white/70 text-center">
                      No questions available for this quiz.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            className="dark border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]" asChild>
            <Link href={`/quiz/${quizId}/take`}>
              <Trophy className="mr-2 h-4 w-4" />
              Take This Quiz
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
