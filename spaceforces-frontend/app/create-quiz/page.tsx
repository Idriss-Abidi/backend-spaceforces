"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/services/uploadImage";
import { createQuiz, type CreateQuizRequest, type QuizQuestion } from "@/services/createQuiz";
import {
  ArrowLeft,
  ChevronRight,
  Menu,
  PlusCircle,
  Rocket,
  Save,
  Sparkles,
  Trash2,
  UploadCloudIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface ExtendedQuizQuestion extends QuizQuestion {
  imageUrl?: string;
}

export default function QuizCreator() {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [difficultyId, setDifficultyId] = useState(1); // 1 = Basics, 2 = Easy, 3 = Medium, 4 = Hard, 5 = Expert
  const [topic, setTopic] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [duration, setDuration] = useState(30); // minutes
  const [quizMode, setQuizMode] = useState("PUBLIC"); // PUBLIC, PRIVATE, OFFICIAL
  const [questions, setQuestions] = useState<ExtendedQuizQuestion[]>([
    {
      id: "q1",
      questionText: "What is the question?",
      points: 10,
      tags: "general",
      options: [
        { optionText: "Option 1", valid: true },
        { optionText: "Option 2", valid: false },
        { optionText: "Option 3", valid: false },
        { optionText: "Option 4", valid: false },
      ],
    },
  ]);
  const [activeQuestionId, setActiveQuestionId] = useState("q1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [questionImages, setQuestionImages] = useState<Record<string, File | null>>({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    const newQuestion: ExtendedQuizQuestion = {
      id: `q${questions.length + 1}`,
      questionText: "New Question",
      points: 10,
      tags: "general",
      options: [
        { optionText: "Option 1", valid: true },
        { optionText: "Option 2", valid: false },
        { optionText: "Option 3", valid: false },
        { optionText: "Option 4", valid: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionId(newQuestion.id);
  };

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      // Create a new array without the question to be removed
      const newQuestions = questions.filter((q) => q.id !== id);
      
      // Find the index of the question in the original array
      const index = questions.findIndex((q) => q.id === id);
      
      // Determine the new active question ID
      let newActiveId;
      if (index > 0) {
        newActiveId = questions[index - 1].id;
      } else {
        newActiveId = newQuestions[0].id;
      }
      
      // Remove any associated image
      if (questionImages[id] || imagePreviewUrls[id]) {
        removeImage(id);
      }
      
      // Update the questions array first
      setQuestions(newQuestions);
      
      // Then update the active question ID
      setActiveQuestionId(newActiveId);
    }
  };

  const updateQuestionTitle = (id: string, questionText: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, questionText } : q)));
  };

  const updateQuestionOption = (id: string, optionIndex: number, optionText: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = { ...newOptions[optionIndex], optionText };

          const updatedQuestion = { ...q, options: newOptions };
          return updatedQuestion;
        }
        return q;
      })
    );
  };

  const updateCorrectOption = (id: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const newOptions = q.options.map((opt, idx) => ({
            ...opt,
            valid: idx === optionIndex,
          }));

          return {
            ...q,
            options: newOptions,
          };
        }
        return q;
      })
    );
  };

  const handleImageSelect = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setQuestionImages((prev) => ({
        ...prev,
        [id]: file,
      }));

      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrls((prev) => ({
        ...prev,
        [id]: previewUrl,
      }));
    }
  };

  const removeImage = (id: string) => {
    // Remove the image from state
    setQuestionImages((prev) => {
      const newImages = { ...prev };
      delete newImages[id];
      return newImages;
    });

    // Revoke the object URL to prevent memory leaks
    if (imagePreviewUrls[id]) {
      URL.revokeObjectURL(imagePreviewUrls[id]);
    }

    // Remove the preview URL
    setImagePreviewUrls((prev) => {
      const newUrls = { ...prev };
      delete newUrls[id];
      return newUrls;
    });

    // Remove imageUrl from the question
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const { imageUrl, ...questionWithoutImage } = q;
          return questionWithoutImage;
        }
        return q;
      })
    );
  };

  const uploadQuestionImages = async () => {
    const uploadPromises = Object.entries(questionImages).map(async ([questionId, file]) => {
      if (!file) return { questionId, imageUrl: null };

      try {
        setUploadingImages((prev) => ({ ...prev, [questionId]: true }));
        const imageUrl = await uploadImage(file);
        return { questionId, imageUrl };
      } catch (error) {
        console.error(`Error uploading image for question ${questionId}:`, error);
        toast.error(`Failed to upload image for question ${questionId}.`);
        return { questionId, imageUrl: null };
      } finally {
        setUploadingImages((prev) => ({ ...prev, [questionId]: false }));
      }
    });

    const uploadResults = await Promise.all(uploadPromises);

    const updatedQuestions = questions.map((question) => {
      const uploadResult = uploadResults.find((result) => result.questionId === question.id);
      return uploadResult?.imageUrl ? { ...question, imageUrl: uploadResult.imageUrl } : question;
    });

    setQuestions(updatedQuestions);
    return updatedQuestions;
  };

  const saveQuiz = async () => {
    try {
      setIsSubmitting(true);

      // Clone current state to avoid mid-edit conflicts
      const currentQuestionImages = { ...questionImages };

      // Upload all images first
      const questionsWithImages = await uploadQuestionImages();

      const failedUploads = Object.keys(currentQuestionImages).filter(
        (questionId) => !questionsWithImages.find((q) => q.id === questionId)?.imageUrl
      );

      if (failedUploads.length > 0) {
        throw new Error("Some images failed to upload");
      }

      const payload: CreateQuizRequest = {
        title: quizTitle,
        description: quizDescription,
        difficultyId,
        topic,
        startDateTime: startDateTime || new Date().toISOString(),
        duration,
        mode: quizMode,
        questions: questionsWithImages.map(({ id, ...question }) => question),
      };

      await createQuiz(payload);
      toast.success("Quiz created successfully!");
      router.push("/my-quizzes");
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast.error("Failed to create quiz. Please check all image uploads and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToQuestion = (id: string) => {
    setActiveQuestionId(id);
    if (questionRefs.current[id]) {
      questionRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setSidebarOpen(false);
  };

  const handleBackToDashboard = () => {
    router.back();
  };

  // Update active question based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for better detection

      // Find the question that's most visible in the viewport
      let closestQuestion = questions[0]?.id;
      let closestDistance = Number.POSITIVE_INFINITY;

      Object.entries(questionRefs.current).forEach(([id, ref]) => {
        if (ref) {
          const distance = Math.abs(ref.getBoundingClientRect().top);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestQuestion = id;
          }
        }
      });

      if (closestQuestion && closestQuestion !== activeQuestionId) {
        setActiveQuestionId(closestQuestion);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [questions, activeQuestionId]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(imagePreviewUrls).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviewUrls]);

  const TimelineSidebar = () => (
    <div className="h-screen flex flex-col border-r border-[#9370DB]/30 bg-[#2E0854]">
      <div className="p-4 border-b border-[#9370DB]/30">
        <Button
          variant="ghost"
          onClick={handleBackToDashboard}
          className="-ml-2 mb-2 w-full justify-start text-white hover:bg-[#4B0082]/30 hover:text-[#E6E6FA]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Rocket className="h-5 w-5 text-[#E6E6FA] rotate-45" />
            <div className="absolute -top-1 -right-1">
              <Sparkles className="h-3 w-3 text-[#E6E6FA]" />
            </div>
          </div>
          <h2 className="font-semibold truncate text-white">{quizTitle}</h2>
        </div>
        <div className="mt-2 text-xs text-white/70">
          {topic ? topic : "No topic"} •{" "}
          {difficultyId === 1 ? "Basics" : difficultyId === 2 ? "Easy" : difficultyId === 3 ? "Medium" : difficultyId === 4 ? "Hard" : "Expert"}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-1">
            <h3 className="text-sm font-medium text-white/70 mb-2">Questions</h3>
            {questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => scrollToQuestion(question.id)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-[#4B0082]/50 flex items-center",
                  activeQuestionId === question.id ? "bg-[#6A0DAD]/30 text-[#E6E6FA] font-medium" : "text-white/70"
                )}
              >
                <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#4B0082]/50 text-xs">
                  {index + 1}
                </span>
                <span className="truncate flex-1">{question.questionText || `Question ${index + 1}`}</span>
                {question.imageUrl && (
                  <span className="mr-1 text-[#9370DB]">
                    <UploadCloudIcon className="h-3 w-3" />
                  </span>
                )}
                {activeQuestionId === question.id && <ChevronRight className="h-4 w-4 ml-1 text-[#E6E6FA]" />}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t border-[#9370DB]/30 mt-auto">
        <Button
          onClick={addQuestion}
          variant="outline"
          className="dark w-full justify-start border-[#9370DB]/30 text-white hover:bg-[#4B0082]/30 hover:text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Question
        </Button>
        <Button
          onClick={saveQuiz}
          disabled={isSubmitting}
          className="w-full mt-2 justify-center bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Quiz
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#2E0854] text-white">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block md:w-64 lg:w-72 shrink-0">
        <TimelineSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-b from-[#2E0854] to-[#4B0082]/90">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
          {/* Mobile Header with Menu Button */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px] border-[#9370DB]/30 bg-[#2E0854]">
                <TimelineSidebar />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Rocket className="h-5 w-5 text-[#E6E6FA] rotate-45" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-3 w-3 text-[#E6E6FA]" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-white">{quizTitle}</h1>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={saveQuiz}
              disabled={isSubmitting}
              className="text-white hover:bg-[#4B0082]/20 hover:text-[#E6E6FA] disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span className="sr-only">Save Quiz</span>
            </Button>
          </div>

          {/* Quiz Title - Hidden on mobile */}
          <div className="hidden md:block mb-8 space-y-4">
            <Input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="text-2xl font-bold border-none text-center focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-white placeholder:text-white/50"
              placeholder="Quiz Title"
            />
            <p className="text-center text-white/70">Create your space quiz by adding questions and answers below</p>
          </div>

          {/* Quiz Details - Hidden on mobile */}
          <div className="hidden md:block mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <textarea
                  id="description"
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full h-20 rounded-md border border-[#9370DB]/30 bg-[#4B0082]/30 px-3 py-2 text-sm text-white placeholder:text-white/50"
                  placeholder="Enter quiz description"
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-white">
                      Difficulty
                    </Label>
                    <select
                      id="difficulty"
                      value={difficultyId}
                      onChange={(e) => setDifficultyId(Number(e.target.value))}
                      className="w-full rounded-md border border-[#9370DB]/30 bg-[#4B0082]/30 px-3 py-2 text-sm text-white"
                    >
                      <option value={1}>Basics</option>
                      <option value={2}>Easy</option>
                      <option value={3}>Medium</option>
                      <option value={4}>Hard</option>
                      <option value={5}>Expert</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-white">
                      Topic
                    </Label>
                    <Input
                      id="topic"
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
                      placeholder="e.g., Astronomy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-white">
                      Start Date & Time
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDateTime}
                      onChange={(e) => setStartDateTime(e.target.value)}
                      className="bg-[#4B0082]/30 border-[#9370DB]/30 text-white"
                    />
                    <p className="text-gray-400 text-sm text-right">{"in (UTC +00:00)"}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-white">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="bg-[#4B0082]/30 border-[#9370DB]/30 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode" className="text-white">
                    Quiz Mode
                  </Label>
                  <select
                    id="mode"
                    value={quizMode}
                    onChange={(e) => setQuizMode(e.target.value)}
                    className="w-full rounded-md border border-[#9370DB]/30 bg-[#4B0082]/30 px-3 py-2 text-sm text-white"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>
            </div>

            <p className="text-center text-white/70">Create your space quiz by adding questions and answers below</p>
          </div>

          {/* Questions */}
          <div className="space-y-6 pb-20">
            {questions.map((question, questionIndex) => (
              <div
                key={question.id}
                ref={(el) => (questionRefs.current[question.id] = el)}
                className={cn(
                  "transition-all duration-200",
                  activeQuestionId === question.id ? "ring-2 ring-[#9370DB]/40 rounded-lg" : ""
                )}
              >
                <Card className="shadow-md bg-[#4B0082]/30 border-[#9370DB]/30 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-medium text-white/70 mb-1">Question {questionIndex + 1}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={question.questionText}
                        onChange={(e) => updateQuestionTitle(question.id, e.target.value)}
                        className="text-lg font-medium focus-visible:ring-1 bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50 flex-1"
                        placeholder="Question title"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeQuestion(question.id);
                        }}
                        disabled={questions.length <= 1}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${question.id}-points`} className="text-white">
                            Points
                          </Label>
                          <Input
                            id={`${question.id}-points`}
                            type="number"
                            min="1"
                            value={question.points}
                            onChange={(e) => {
                              const points = Number(e.target.value);
                              setQuestions(questions.map((q) => (q.id === question.id ? { ...q, points } : q)));
                            }}
                            className="bg-[#4B0082]/30 border-[#9370DB]/30 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${question.id}-tags`} className="text-white">
                            Tags
                          </Label>
                          <Input
                            id={`${question.id}-tags`}
                            type="text"
                            value={question.tags}
                            onChange={(e) => {
                              const tags = e.target.value;
                              setQuestions(questions.map((q) => (q.id === question.id ? { ...q, tags } : q)));
                            }}
                            className="bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
                            placeholder="e.g., planets, solar-system"
                          />
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor={`${question.id}-image`} className="text-white">
                          Question Image (Optional)
                        </Label>
                        <div className="space-y-2">
                          {imagePreviewUrls[question.id] ? (
                            <div className="relative">
                              <img
                                src={imagePreviewUrls[question.id] || "/placeholder.svg"}
                                alt="Question preview"
                                className="w-full h-48 object-cover rounded-md border border-[#9370DB]/30"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600"
                                onClick={() => removeImage(question.id)}
                                disabled={isSubmitting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {question.imageUrl && (
                                <div className="absolute bottom-2 right-2 bg-[#6A0DAD]/80 text-white text-xs px-2 py-1 rounded">
                                  Image uploaded ✓
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-full">
                              <label
                                htmlFor={`${question.id}-image-upload`}
                                className={cn(
                                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-[#9370DB]/30 bg-[#4B0082]/20 hover:bg-[#4B0082]/30",
                                  isSubmitting && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <UploadCloudIcon className="h-6 w-6 text-white m-2" />
                                  <p className="mb-2 text-sm text-white">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                  </p>
                                  <p className="text-xs text-white/70">PNG, JPG or GIF (MAX. 2MB)</p>
                                </div>
                                <input
                                  id={`${question.id}-image-upload`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleImageSelect(question.id, e)}
                                  disabled={isSubmitting}
                                />
                              </label>
                            </div>
                          )}
                          {uploadingImages[question.id] && (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span className="ml-2 text-sm text-white">Uploading image...</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label className="text-base text-white">Answer options</Label>
                        <RadioGroup
                          value={question.options.findIndex((opt) => opt.valid).toString()}
                          onValueChange={(value) => updateCorrectOption(question.id, Number.parseInt(value))}
                          className="space-y-3"
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={optionIndex.toString()}
                                id={`${question.id}-option-${optionIndex}`}
                                className="border-[#9370DB]/50 text-[#E6E6FA]"
                                disabled={isSubmitting}
                              />
                              <Input
                                type="text"
                                value={option.optionText}
                                onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                                className="flex-1 bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
                                placeholder={`Option ${optionIndex + 1}`}
                                disabled={isSubmitting}
                              />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Mobile Add Question Button */}
          <div className="md:hidden fixed bottom-4 right-4">
            <Button
              onClick={addQuestion}
              size="icon"
              disabled={isSubmitting}
              className="dark h-12 w-12 rounded-full shadow-lg bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA] disabled:opacity-50"
            >
              <PlusCircle className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
