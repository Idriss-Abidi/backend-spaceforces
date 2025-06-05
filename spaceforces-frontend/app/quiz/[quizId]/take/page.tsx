import QuizTaking from "@/components/quiz-taking";

export default function QuizTakingPage({ params }: { params: { quizId: string } }) {
  const quizId = params.quizId as string;

  return (
    <div>
      <QuizTaking quizId={quizId} />
    </div>
  );
}
