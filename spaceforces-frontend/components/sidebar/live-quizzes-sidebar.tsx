"use client";

import Link from "next/link";
import { Satellite, ChevronRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quiz } from "@/types";

interface LiveQuizzesSidebarProps {
  liveQuizzes: Quiz[];
}

export default function LiveQuizzesSidebar({ liveQuizzes }: LiveQuizzesSidebarProps) {
  return (
    <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl text-white">
          <Satellite className="mr-2 h-5 w-5 text-[#E6E6FA]" />
          Live Quizzes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {liveQuizzes.length > 0 ? (
          <div className="space-y-3">
            {liveQuizzes.map((quiz) => (
              <Link key={quiz.id} href={`/quiz/${quiz.id}`}>
                <Card className="overflow-hidden transition-all hover:shadow-md hover:bg-[#4B0082]/30 border-[#9370DB]/30">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-base line-clamp-1 text-white">{quiz.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <div className="flex items-center text-xs text-white/70">
                      <span className="font-medium text-white">{quiz.duration} min</span>
                      <span className="mx-1">•</span>
                      <span className="text-xs">{quiz.mode}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-white/70 text-center py-4">No live quizzes at the moment.</p>
        )}
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
          asChild
        >
          <Link href="/live-quizzes">
            View All Live Quizzes
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
