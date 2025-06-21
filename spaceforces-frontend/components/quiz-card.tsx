import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { GetQuizzesResponse } from "@/services/getQuizzes";
import { formatDate, formatDuration, getDifficultyColor, getStatusColor } from "@/lib/utils";
import { QuizStatus } from "@/types";

interface QuizCardProps {
  quiz: GetQuizzesResponse;
  compact?: boolean;
  onQuizSelect: (quiz: GetQuizzesResponse) => void;
}

export default function QuizCard({ quiz, compact = false, onQuizSelect }: QuizCardProps) {
  const handleQuizSelect = () => {
    onQuizSelect(quiz);
  };

  if (compact) {
    return (
      <Card className="overflow-hidden transition-all hover:shadow-md hover:bg-[#4B0082]/30 border-[#9370DB]/30">
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty.diff)}>
              {quiz.difficulty.diff}
            </Badge>
            <Badge variant="outline" className={getStatusColor(quiz.status)}>
              {quiz.status || "CREATED"}
            </Badge>
          </div>
          <CardTitle className="mt-1 text-base line-clamp-1 text-white">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-1">
          <div className="flex items-center text-xs text-white/70">
            <span className="font-medium text-white">{formatDuration(quiz.duration)}</span>
            <span className="mx-1">•</span>
            <span className="text-xs">{quiz.mode}</span>
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs text-white/70">{quiz.topic || "General"}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-[#E6E6FA] hover:bg-[#4B0082]/50 hover:text-[#E6E6FA]"
            onClick={handleQuizSelect}
          >
            Take
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:bg-[#4B0082]/30 border-[#9370DB]/30">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className={getDifficultyColor(quiz.difficulty.diff)}>
            {quiz.difficulty.diff}
          </Badge>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(quiz.status)}>
              {quiz.status || "CREATED"}
            </Badge>
            <Badge variant="secondary" className="bg-[#4B0082]/30 text-white/90 hover:bg-[#4B0082]/50">
              {quiz.mode}
            </Badge>
          </div>
        </div>
        <CardTitle className="mt-2 line-clamp-1 text-white">{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {quiz.description && <p className="text-sm text-white/70 mb-3 line-clamp-2">{quiz.description}</p>}
        <div className="flex flex-wrap gap-1 mb-3">
          {quiz.topic && (
            <Badge variant="secondary" className="text-xs bg-[#4B0082]/30 text-white/90 hover:bg-[#4B0082]/50">
              {quiz.topic}
            </Badge>
          )}
        </div>
        <div className="flex items-center text-sm text-white/70">
          <span className="font-medium text-white">{formatDuration(quiz.duration)}</span>
          <span className="mx-2">•</span>
          {quiz.startDateTime && (
            <>
              <span>Starts: {formatDate(quiz.startDateTime)}</span>
              <span className="mx-2">•</span>
            </>
          )}
          <span>Created: {formatDate(quiz.createdAt)}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm text-white/70">ID: {quiz.id}</span>
        </div>
        <Button
          variant="default"
          size="sm"
          className="gap-1 bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
          onClick={handleQuizSelect}
        >
          {quiz.status === QuizStatus.LIVE ? "Take Quiz" : "See Results"}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
