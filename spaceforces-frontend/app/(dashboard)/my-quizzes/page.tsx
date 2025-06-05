"use client";

import { QuizStatusModal } from "@/components/quiz-status-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/store";
import { formatDate, formatDuration, getDifficultyColor, getStatusColor } from "@/lib/utils";
import { deleteQuizById } from "@/services/deleteQuizById";
import { getQuizzesByUserId } from "@/services/getQuizzesByUserId";
import type { Quiz } from "@/types";
import {
  BookOpen,
  Edit,
  MoreHorizontal,
  Plus,
  Rocket,
  Search,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MyQuizzesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const userId = user?.id;
      if (!userId) {
        return;
      }
      const userQuizzes = await getQuizzesByUserId(userId!);
      setQuizzes(userQuizzes);
      setFilteredQuizzes(userQuizzes);
    } catch (error) {
      toast.error("Failed to load your quizzes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
    }

    fetchQuizzes();
  }, [user]);

  // Filter quizzes based on search query and active tab
  useEffect(() => {
    let filtered = quizzes;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (quiz.description &&
            quiz.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (quiz.topic && quiz.topic.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((quiz) => quiz.status === activeTab.toUpperCase());
    }

    setFilteredQuizzes(filtered);
  }, [searchQuery, activeTab, quizzes]);

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleDeleteQuiz = async (quizId: string) => {
    await deleteQuizById(quizId);
    toast.success("Quiz deleted successfully");
    fetchQuizzes();
  };

  const getQuizCountByStatus = (status: string) => {
    return quizzes.filter((quiz) => quiz.status === status.toUpperCase()).length;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center text-white">
          <BookOpen className="mr-2 h-6 w-6 text-[#E6E6FA]" />
          My Quizzes
        </h1>
        <p className="text-white/70">Manage and track all the quizzes you've created</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
          <Input
            type="search"
            placeholder="Search your quizzes..."
            className="w-full pl-8 bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]" asChild>
            <Link href="/create-quiz">
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="bg-[#4B0082]/30 border border-[#9370DB]/30">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
          >
            All Quizzes ({quizzes.length})
          </TabsTrigger>
          <TabsTrigger
            value="created"
            className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
          >
            Created ({getQuizCountByStatus("CREATED")})
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
          >
            Live ({getQuizCountByStatus("LIVE")})
          </TabsTrigger>
          <TabsTrigger
            value="finished"
            className="data-[state=active]:bg-[#6A0DAD] data-[state=active]:text-[#E6E6FA]"
          >
            Finished ({getQuizCountByStatus("FINISHED")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {renderQuizGrid()}
        </TabsContent>
        <TabsContent value="created" className="mt-6">
          {renderQuizGrid()}
        </TabsContent>
        <TabsContent value="live" className="mt-6">
          {renderQuizGrid()}
        </TabsContent>
        <TabsContent value="finished" className="mt-6">
          {renderQuizGrid()}
        </TabsContent>
      </Tabs>

      {selectedQuiz && (
        <QuizStatusModal
          quiz={selectedQuiz as any}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );

  function renderQuizGrid() {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#9370DB] border-r-transparent align-[-0.125em]"></div>
          <span className="ml-3 text-white/70">Loading your quizzes...</span>
        </div>
      );
    }

    if (filteredQuizzes.length === 0) {
      return (
        <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-[#4B0082]/30 p-4 rounded-full mb-4">
              <Rocket className="h-10 w-10 text-[#9370DB]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No quizzes found</h3>
            <p className="text-white/70 text-center max-w-md mb-6">
              {searchQuery
                ? "No quizzes match your search criteria. Try a different search term."
                : "You haven't created any quizzes yet. Create your first quiz to get started!"}
            </p>
            <Button className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]" asChild>
              <Link href="/create-quiz">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className={getDifficultyColor(quiz.difficulty.diff)}>
                  {quiz.difficulty.diff}
                </Badge>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(quiz.status)}>
                    {quiz.status || "CREATED"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white/70 hover:text-white"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#2E0854] border-[#9370DB]/30 text-white"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-[#4B0082]/50"
                        onClick={() => handleQuizSelect(quiz)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer hover:bg-[#4B0082]/50"
                        onClick={() => router.push(`/edit-quiz/${quiz.id}`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => handleDeleteQuiz(String(quiz.id))}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Quiz
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardTitle className="mt-2 line-clamp-1 text-white">{quiz.title}</CardTitle>
              <CardDescription className="text-white/70 line-clamp-2">
                {quiz.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-1 mb-3">
                {quiz.topic && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-[#4B0082]/30 text-white/90 hover:bg-[#4B0082]/50"
                  >
                    {quiz.topic}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="text-xs bg-[#4B0082]/30 text-white/90 hover:bg-[#4B0082]/50"
                >
                  {quiz.mode}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-white/70">
                <span className="font-medium text-white">{formatDuration(quiz.duration)}</span>
                <span className="mx-2">•</span>
                {quiz.startDateTime && (
                  <>
                    <span>Starts: {formatDate(new Date(quiz.startDateTime))}</span>
                    <span className="mx-2">•</span>
                  </>
                )}
                <span>Created: {formatDate(new Date(quiz.createdAt || ""))}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <User className="h-3.5 w-3.5" />
                <span>Created by you</span>
              </div>
              <Button
                variant="default"
                size="sm"
                className="ml-auto bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]"
                onClick={() => handleQuizSelect(quiz)}
              >
                View Quiz
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
}
