"use client"

import { useEffect, useState } from "react"
import { Trophy, Search, ArrowUpDown, ChevronDown, User, Calendar, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getLeaderboard } from "@/services/getLeaderboard"
import toast from "react-hot-toast"
import type { Participation } from "@/types"

// Process leaderboard data to create a user-based ranking
function processLeaderboardData(participations: Participation[]) {
  // Filter out entries with null users
  const validParticipations = participations.filter((p) => p.user !== null)

  // Group by user and calculate total score
  const userScores = validParticipations.reduce((acc: any, participation) => {
    const userId = participation.user.id

    if (!acc[userId]) {
      acc[userId] = {
        user: participation.user,
        totalScore: 0,
        participationCount: 0,
        highestScore: 0,
        quizzesTaken: [],
        lastParticipation: null,
      }
    }

    acc[userId].totalScore += participation.score
    acc[userId].participationCount += 1
    acc[userId].highestScore = Math.max(acc[userId].highestScore, participation.score)
    acc[userId].quizzesTaken.push({
      quizId: participation.quiz.id,
      quizTitle: participation.quiz.title,
      score: participation.score,
      completionTime: participation.completionTime,
    })

    // Track the most recent participation
    const completionTime = new Date(participation.completionTime)
    if (!acc[userId].lastParticipation || completionTime > new Date(acc[userId].lastParticipation)) {
      acc[userId].lastParticipation = participation.completionTime
    }

    return acc
  }, {})

  // Convert to array and sort by total score
  const leaderboard = Object.values(userScores)
    .sort((a: any, b: any) => b.totalScore - a.totalScore)
    .map((entry: any, index) => ({
      rank: index + 1,
      userId: entry.user.id,
      username: entry.user.username,
      points: entry.totalScore,
      rankTitle: entry.user.rank?.title || "Space Cadet",
      rankAbbreviation: entry.user.rank?.abbreviation || "SC",
      participationCount: entry.participationCount,
      highestScore: entry.highestScore,
      lastActive: entry.lastParticipation,
      quizzesTaken: entry.quizzesTaken,
      avatar: `/placeholder.svg?height=40&width=40`, // Placeholder avatar
    }))

  return leaderboard
}

// Format date for display
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("points")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true)
        const participations = await getLeaderboard()
        const processedData: any = processLeaderboardData(participations)
        setLeaderboard(processedData)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        toast.error("Failed to load leaderboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  // Filter leaderboard based on search query
  const filteredLeaderboard = leaderboard.filter(
    (player: any) =>
      player.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.rankTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort leaderboard based on selected column and order
  const sortedLeaderboard = [...filteredLeaderboard].sort((a: any, b: any) => {
    let comparison = 0

    switch (sortBy) {
      case "rank":
        comparison = a.rank - b.rank
        break
      case "username":
        comparison = a.username.localeCompare(b.username)
        break
      case "points":
        comparison = a.points - b.points
        break
      case "participationCount":
        comparison = a.participationCount - b.participationCount
        break
      case "highestScore":
        comparison = a.highestScore - b.highestScore
        break
      case "lastActive":
        comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime()
        break
      default:
        comparison = a.points - b.points
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  // Handle sort change
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  // Get medal color based on rank
  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-[#FFD700]" // Gold
      case 2:
        return "text-[#C0C0C0]" // Silver
      case 3:
        return "text-[#CD7F32]" // Bronze
      default:
        return "text-white/70"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center text-white">
          <Trophy className="mr-2 h-6 w-6 text-[#E6E6FA]" />
          Cosmic Leaderboard
        </h1>
        <p className="text-white/70">Explore the rankings of space explorers across the galaxy</p>
      </div>

      <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-white">Explorer Rankings</CardTitle>
              <CardDescription className="text-white/70">
                {filteredLeaderboard.length} cosmic explorers ranked by total points
              </CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Search explorers..."
                className="w-full pl-8 bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#9370DB] border-r-transparent align-[-0.125em]"></div>
              <p className="text-white/70">Loading leaderboard data...</p>
            </div>
          ) : sortedLeaderboard.length > 0 ? (
            <div className="rounded-md border border-[#9370DB]/30 overflow-hidden">
              <Table>
                <TableHeader className="bg-[#4B0082]/30">
                  <TableRow className="hover:bg-[#6A0DAD]/20 border-[#9370DB]/30">
                    <TableHead className="text-white w-16">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-white"
                        onClick={() => handleSort("rank")}
                      >
                        Rank
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-white"
                        onClick={() => handleSort("username")}
                      >
                        Explorer
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white text-right">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-white"
                        onClick={() => handleSort("points")}
                      >
                        Total Points
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white text-center hidden md:table-cell">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-white"
                        onClick={() => handleSort("participationCount")}
                      >
                        Quizzes
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white text-right hidden md:table-cell">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-white"
                        onClick={() => handleSort("highestScore")}
                      >
                        Best Score
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white text-right hidden lg:table-cell">
                      <Button
                        variant="ghost"
                        className="p-0 hover:bg-transparent hover:text-white"
                        onClick={() => handleSort("lastActive")}
                      >
                        Last Active
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-white text-center w-16 hidden lg:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLeaderboard.map((player: any) => (
                    <TableRow key={player.userId} className="hover:bg-[#6A0DAD]/20 border-[#9370DB]/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#4B0082]/50">
                          {player.rank <= 3 ? (
                            <Trophy className={`h-4 w-4 ${getMedalColor(player.rank)}`} />
                          ) : (
                            <span className="text-sm font-medium text-white">{player.rank}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-[#9370DB]/50">
                            <AvatarImage src={player.avatar} alt={player.username} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">{player.username}</div>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs h-5 px-1.5 bg-[#4B0082]/30 text-white/70">
                                {player.rankTitle}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#E6E6FA]">
                        {player.points.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <Badge className="bg-[#6A0DAD] hover:bg-[#6A0DAD]/80">{player.participationCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell text-white">
                        {player.highestScore.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell text-white/70">
                        {player.lastActive ? formatDate(player.lastActive) : "N/A"}
                      </TableCell>
                      <TableCell className="text-center hidden lg:table-cell">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-[#2E0854] border-[#9370DB]/30 text-white">
                            <div className="p-2">
                              <h4 className="font-medium text-sm mb-1">Recent Quizzes</h4>
                              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {player.quizzesTaken.slice(0, 5).map((quiz: any, index: any) => (
                                  <div key={index} className="text-xs p-1.5 rounded bg-[#4B0082]/30">
                                    <div className="font-medium">{quiz.quizTitle}</div>
                                    <div className="flex justify-between mt-1 text-white/70">
                                      <span>Score: {quiz.score}</span>
                                      <span>{formatDate(quiz.completionTime)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-white/70">No leaderboard data available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-white">
              <Trophy className="mr-2 h-5 w-5 text-[#FFD700]" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedLeaderboard.slice(0, 3).map((player: any) => (
                <div key={player.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#4B0082]/50 ${getMedalColor(player.rank)}`}
                    >
                      <Trophy className="h-3.5 w-3.5" />
                    </div>
                    <div className="font-medium text-white">{player.username}</div>
                  </div>
                  <div className="font-bold text-[#E6E6FA]">{player.points.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-white">
              <Award className="mr-2 h-5 w-5 text-[#E6E6FA]" />
              Rank Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[120px] flex items-center justify-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#9370DB] border-r-transparent align-[-0.125em]"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from(new Set(leaderboard.map((player: any) => player.rankTitle))).map((rankTitle, index) => {
                  const count = leaderboard.filter((player: any) => player.rankTitle === rankTitle).length
                  const percentage = Math.round((count / leaderboard.length) * 100)

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{rankTitle}</span>
                        <span className="text-white/70">
                          {count} explorers ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-[#4B0082]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#9370DB] to-[#BA55D3]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-white">
              <Calendar className="mr-2 h-5 w-5 text-[#E6E6FA]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[120px] flex items-center justify-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#9370DB] border-r-transparent align-[-0.125em]"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedLeaderboard
                  .sort((a: any, b: any) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
                  .slice(0, 4)
                  .map((player: any) => (
                    <div key={player.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-[#9370DB]/50">
                          <AvatarImage src={player.avatar} alt={player.username} />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm font-medium text-white">{player.username}</div>
                      </div>
                      <div className="text-xs text-white/70">{formatDate(player.lastActive)}</div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

