import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SpaceStatsSidebar() {
  // In a real app, you would fetch this data from an API
  // For now, we'll use mock data
  const stats = {
    totalQuizzes: 248,
    explorers: 3592,
    quizzesTaken: 42567,
    categories: 12,
  }

  return (
    <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white">Space Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-white/70">Total Quizzes</p>
            <p className="text-2xl font-bold text-[#E6E6FA]">{stats.totalQuizzes}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/70">Explorers</p>
            <p className="text-2xl font-bold text-[#E6E6FA]">{stats.explorers.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/70">Quizzes Taken</p>
            <p className="text-2xl font-bold text-[#E6E6FA]">{stats.quizzesTaken.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/70">Categories</p>
            <p className="text-2xl font-bold text-[#E6E6FA]">{stats.categories}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

