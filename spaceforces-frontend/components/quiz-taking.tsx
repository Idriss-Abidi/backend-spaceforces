"use client";

import { AlertCircle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import { createQuizSubmission } from "@/services/createQuizSubmission";
import { getOptionsByQuestionId } from "@/services/getOptionsByQuestionId";
import { getQuestionsByQuizId } from "@/services/getQuestionsByQuizId";
import { getQuizInfoById } from "@/services/getQuizInfoById";
import type { Option, Quiz, QuizQuestion } from "@/types";
import Image from "next/image";
import toast from "react-hot-toast";

interface QuizTakingProps {
  quizId: string;
}

export default function QuizTaking({ quizId }: QuizTakingProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [options, setOptions] = useState<Record<number, Option[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const quizData = await getQuizInfoById(quizId);
        setQuiz(quizData);

        // Set timer based on quiz duration
        setTimeRemaining(quizData.duration * 60);

        const questionsData = await getQuestionsByQuizId(quizId);
        setQuestions(questionsData);

        const optionsMap: Record<number, Option[]> = {};
        for (const question of questionsData) {
          const questionOptions = await getOptionsByQuestionId(question.id.toString());
          optionsMap[question.id] = questionOptions;
        }
        setOptions(optionsMap);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching quiz data:", err);
        setError("Failed to load quiz data. Please try again later.");
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId]);

  // Handle timer countdown
  useEffect(() => {
    if (loading || !quiz || timeRemaining <= 0) return;
    const endTime = new Date(quiz.startDateTime || "");
    endTime.setSeconds(endTime.getSeconds() + quiz.duration * 60);
    const currentTime = new Date();
    const remainingTime = Math.floor((endTime.getTime() - currentTime.getTime()) / 1000);
    setTimeRemaining(remainingTime);
    if (remainingTime <= 0) {
      setIsQuizComplete(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsQuizComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizComplete, loading, quiz, timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Get current question and options
  const currentQuestion = questions[currentQuestionIndex] || null;
  const currentOptions = currentQuestion ? options[currentQuestion.id] || [] : [];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Handle answer selection
  const handleAnswerSelect = (optionId: string) => {
    if (!currentQuestion) return;

    // Save the selected answer
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: Number.parseInt(optionId),
    }));
  };

  // Handle navigation between questions
  const handleNavigation = (direction: "prev" | "next") => {
    if (direction === "prev" && currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (direction === "next") {
      if (currentQuestionIndex === questions.length - 1) {
        // If it's the last question, mark the quiz as complete
        setIsQuizComplete(true);
      } else if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    if (!quiz) return;

    setIsSubmitting(true);

    try {
      const submissions = Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
        questionId: Number.parseInt(questionId),
        optionId: optionId,
      }));

      await createQuizSubmission({ submissions });

      toast.success("Quiz submitted successfully!");
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Failed to submit quiz. Please try again.");
    }

    setIsSubmitting(false);
  };

  // Handle going back to quiz list
  const handleBackToQuizzes = () => {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
      router.push("/");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#9370DB] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-white/70">Loading quiz...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white flex items-center justify-center">
        <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">Error Loading Quiz</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-center">{error || "Failed to load quiz data."}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="default"
              className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
              onClick={() => router.push("/quizzes")}
            >
              Back to Quizzes
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (quiz.status === "FINISHED") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white flex items-center justify-center">
        <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">Quiz Finished</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/70 text-center">This quiz is no longer available.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              variant="default"
              className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
              onClick={() => router.push("/")}
            >
              Back to Quizzes
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000000] via-[#1A0033] to-[#2E0854] text-white">
      {/* Header with timer and progress */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/40 border-b border-[#9370DB]/30">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#4B0082]/20"
              onClick={handleBackToQuizzes}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Quiz
            </Button>

            <div className="flex items-center">
              <div className="text-sm font-medium mr-4">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div
                className={cn(
                  "flex items-center px-3 py-1 rounded-full text-sm font-medium",
                  timeRemaining < 60 ? "bg-red-500/20 text-red-300" : "bg-[#4B0082]/30 text-white"
                )}
              >
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          <Progress
            value={progress}
            className="h-1 mt-2 bg-[#4B0082]/30"
            indicatorClassName="bg-gradient-to-r from-[#9370DB] to-[#BA55D3]"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!isQuizComplete && currentQuestion ? (
          <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl md:text-2xl text-white">{currentQuestion.questionText}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentQuestion?.imageUrl && (
                <Image
                  src={currentQuestion.imageUrl}
                  alt="Supporting image"
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: "100%", height: "auto" }}
                  className="rounded-lg mb-4"
                />
              )}

              <RadioGroup
                value={selectedAnswers[currentQuestion.id]?.toString() || ""}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {currentOptions.map((option) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === option.id;
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "flex items-center space-x-2 rounded-lg border p-4 transition-colors",
                        isSelected
                          ? "bg-[#6A0DAD]/40 border-[#9370DB] ring-2 ring-[#9370DB]"
                          : "border-[#9370DB]/30 hover:bg-[#4B0082]/30"
                      )}
                    >
                      <RadioGroupItem
                        value={option.id.toString()}
                        id={option.id.toString()}
                        className="border-[#9370DB]/50 text-[#E6E6FA]"
                      />
                      <Label htmlFor={option.id.toString()} className="flex-1 cursor-pointer text-white">
                        {option.optionText}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              <div className="text-sm text-white/70 mt-2 flex items-center">
                <div className="flex-1">
                  {selectedAnswers[currentQuestion.id]
                    ? "Your answer is saved. Click Next to continue."
                    : "Select an answer to continue."}
                </div>
                <div className="text-xs text-white/50">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("prev")}
                disabled={!selectedAnswers[currentQuestion.id]}
                className={cn(
                  "bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]",
                  !selectedAnswers[currentQuestion.id] && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigation("next")}
                disabled={!selectedAnswers[currentQuestion.id]}
                className="bg-[#6A0DAD] border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
              >
                {isLastQuestion ? "Finish" : "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl text-center text-white">Quiz Complete!</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#4B0082]/30 mb-4">
                  <CheckCircle2 className="h-10 w-10 text-[#E6E6FA]" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">You've answered all questions</h3>
                <p className="text-white/70">
                  You've answered {Object.keys(selectedAnswers).length} out of {questions.length} questions.
                  {Object.keys(selectedAnswers).length < questions.length && (
                    <span className="block mt-2 text-amber-400">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Some questions are unanswered. You can go back to review before submitting.
                    </span>
                  )}
                </p>
              </div>

              {/* Question review */}
              <div className="space-y-2">
                <h4 className="font-medium text-white">Question Summary:</h4>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => (
                    <Button
                      key={question.id}
                      variant={selectedAnswers[question.id] ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        selectedAnswers[question.id]
                          ? "bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
                          : "border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20"
                      )}
                      onClick={() => {
                        setIsQuizComplete(false);
                        setCurrentQuestionIndex(index);
                      }}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
              {/* <Button
                variant="outline"
                onClick={() => setIsQuizComplete(false)}
                className="dark w-full sm:w-auto border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Review Answers
              </Button> */}

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="dark w-full sm:w-auto bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Submit Quiz
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}
