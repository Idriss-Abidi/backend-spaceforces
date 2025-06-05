"use client";

import { Filter, SpaceIcon as Planet, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import LeaderboardSidebar from "@/components/sidebar/leaderboard-sidebar";
import SpaceStatsSidebar from "@/components/sidebar/space-stats-sidebar";
import { getQuizzes, type GetQuizzesResponse } from "@/services/getQuizzes";
import HomePageParticles from "@/components/HomePageParticles";
import { QuizStatusModal } from "@/components/quiz-status-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import QuizCard from "@/components/quiz-card";

export default function SpaceforcesHome() {
  const [selectedQuiz, setSelectedQuiz] = useState<GetQuizzesResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allQuizzes, setAllQuizzes] = useState<GetQuizzesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    difficulty: "all",
    category: "all",
    sortBy: "newest",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 quizzes per page

  useEffect(() => {
    // Set dark mode by default
    if (!document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.add("dark");
    }

    const fetchQuizzes = async () => {
      setLoading(true);
      const quizzes = await getQuizzes();
      setAllQuizzes(quizzes);
      setLoading(false);
    };

    fetchQuizzes();
  }, []);

  const handleQuizSelect = (quiz: GetQuizzesResponse) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilterOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getFilteredQuizzes = () => {
    if (!allQuizzes) return [];

    return allQuizzes
      .filter((quiz) => {
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = quiz.title.toLowerCase().includes(query);
          const matchesDescription = quiz.description?.toLowerCase().includes(query) || false;
          const matchesAuthor = quiz.createdBy.username?.toLowerCase().includes(query) || false;
          const matchesTags = quiz.topic?.some((tag) => tag.toLowerCase().includes(query)) || false;

          if (!(matchesTitle || matchesDescription || matchesAuthor || matchesTags)) {
            return false;
          }
        }

        // Difficulty filter
        if (
          filterOptions.difficulty !== "all" &&
          quiz.difficulty.diff !== filterOptions.difficulty
        ) {
          return false;
        }

        // Category filter
        if (filterOptions.category !== "all" && !quiz.topic?.includes(filterOptions.category)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by selected option
        if (filterOptions.sortBy === "newest") {
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        } else if (filterOptions.sortBy === "difficulty") {
          const difficultyOrder = { "Basics": 1, "Easy": 2, "Medium": 3, "Hard": 4, "Expert": 5 };
          return (
            (difficultyOrder[a.difficulty.diff as keyof typeof difficultyOrder] || 0) -
            (difficultyOrder[b.difficulty.diff as keyof typeof difficultyOrder] || 0)
          );
        }
        return 0;
      });
  };

  const getPaginatedQuizzes = () => {
    const filtered = getFilteredQuizzes();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      quizzes: filtered.slice(startIndex, endIndex),
      totalQuizzes: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  const { quizzes: paginatedQuizzes, totalQuizzes, totalPages } = getPaginatedQuizzes();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of quiz list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterOptions]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-container') && isFilterOpen) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="min-h-screen text-white relative overflow-hidden">
          <div className="fixed inset-0 z-0">
            <HomePageParticles id="tsparticles" />
          </div>
          <div className="relative z-10 px-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 flex items-center text-white">
                <Planet className="mr-2 h-6 w-6 text-[#E6E6FA]" />
                Space Quiz Explorer
              </h1>
              <p className="text-white/70">
                Discover and conquer space-themed quizzes to test your cosmic knowledge
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-auto sm:flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
                <Input
                  type="search"
                  placeholder="Search quizzes by title, tag, or author..."
                  className="w-full pl-8 bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative filter-container">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[#1E0035] border border-[#9370DB]/30 z-50 transition-all duration-200">
                      <div className="p-2">
                        <div className="mb-2">
                          <label className="block text-sm text-white/70 mb-1">Difficulty</label>
                          <select
                            className="w-full h-8 rounded-md border border-[#9370DB]/30 bg-[#4B0082]/30 px-2 text-sm text-white"
                            value={filterOptions.difficulty}
                            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
                          >
                            <option value="all">All Difficulties</option>
                            <option value="Basics">Basics</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                        <div className="mb-2">
                          <label className="block text-sm text-white/70 mb-1">Category</label>
                          <select
                            className="w-full h-8 rounded-md border border-[#9370DB]/30 bg-[#4B0082]/30 px-2 text-sm text-white"
                            value={filterOptions.category}
                            onChange={(e) => handleFilterChange("category", e.target.value)}
                          >
                            <option value="all">All Categories</option>
                            <option value="astronomy">Astronomy</option>
                            <option value="physics">Physics</option>
                            <option value="space-exploration">Space Exploration</option>
                            <option value="planets">Planets</option>
                            <option value="stars">Stars</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <select
                  className="h-9 rounded-md border border-[#9370DB]/30 bg-[#4B0082]/30 px-3 py-1 text-sm text-white"
                  value={filterOptions.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : paginatedQuizzes.length > 0 ? (
              <>
                <div className="mb-4 text-white/70 text-sm">
                  Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalQuizzes)} of {totalQuizzes} quizzes
                </div>
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {paginatedQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} quiz={quiz} onQuizSelect={handleQuizSelect} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        const showEllipsis = 
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 && currentPage < totalPages - 2);
                        
                        if (showEllipsis) {
                          return (
                            <span key={page} className="px-2 text-white/50">
                              ...
                            </span>
                          );
                        }
                        
                        if (!showPage) return null;
                        
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={
                              currentPage === page
                                ? "bg-[#4B0082] text-white"
                                : "border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                            }
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-white/70 mb-2">No quizzes match your search criteria.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterOptions({
                      difficulty: "all",
                      category: "all",
                      sortBy: "newest",
                    });
                  }}
                  className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-8 lg:sticky lg:top-24">
          <LeaderboardSidebar />
          <SpaceStatsSidebar />
        </div>
        <QuizStatusModal quiz={selectedQuiz} open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    </main>
  );
}
