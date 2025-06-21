"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getLeaderboard } from "@/services/getLeaderboard";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import type { Participation } from "@/types";

function processLeaderboardData(participations: Participation[]) {
  const validParticipations = participations.filter((p) => p.user !== null);

  // Group by user and calculate total score
  const userScores = validParticipations.reduce((acc: any, participation) => {
    const userId = participation.user.id;

    if (!acc[userId]) {
      acc[userId] = {
        user: participation.user,
        totalScore: 0,
        participationCount: 0,
        highestScore: 0,
      };
    }

    acc[userId].totalScore += participation.score;
    acc[userId].participationCount += 1;
    acc[userId].highestScore = Math.max(acc[userId].highestScore, participation.score);

    return acc;
  }, {});

  // Convert to array and sort by total score
  const leaderboard = Object.values(userScores)
    .sort((a: any, b: any) => b.totalScore - a.totalScore)
    .slice(0, 10) // Get top 10
    .map((entry: any, index) => ({
      rank: index + 1,
      username: entry.user.username,
      points: entry.totalScore,
      rankTitle: entry.user.rank?.title || "Space Cadet",
      participationCount: entry.participationCount,
      highestScore: entry.highestScore,
      avatar: `/placeholder.svg?height=40&width=40`, // Placeholder avatar
    }));

  return leaderboard;
}

export default function LeaderboardSidebar() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const participations = await getLeaderboard();
        const processedData: any = processLeaderboardData(participations);
        setLeaderboard(processedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast.error("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <Card className="bg-black/40 border-[#9370DB]/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl text-white">
          <Trophy className="mr-2 h-5 w-5 text-[#E6E6FA]" />
          Cosmic Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[400px] pr-4 -mr-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#9370DB] border-r-transparent align-[-0.125em]"></div>
              <p className="text-sm text-white/70">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((player: any) => (
                <div
                  key={player.rank}
                  className="flex items-center justify-between p-3 rounded-md bg-[#6A0DAD]/20 hover:bg-[#6A0DAD]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4B0082]/50">
                      {player.rank <= 3 ? (
                        <Trophy
                          className={`h-3.5 w-3.5 ${
                            player.rank === 1
                              ? "text-[#FFD700]"
                              : player.rank === 2
                              ? "text-[#C0C0C0]"
                              : "text-[#CD7F32]"
                          }`}
                        />
                      ) : (
                        <span className="text-xs font-medium text-white">{player.rank}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-[#9370DB]/50">
                          <AvatarImage src={player.avatar} alt={player.username} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm text-white">{player.username}</span>
                      </div>
                      <div className="flex items-center mt-1 ml-9">
                        <Badge variant="outline" className="text-[0.65rem] h-4 px-1 bg-[#4B0082]/30 text-white/70">
                          {player.rankTitle}
                        </Badge>
                        <span className="text-[0.65rem] text-white/50 ml-2">{player.participationCount} quizzes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-bold text-sm text-[#E6E6FA]">{player.points.toLocaleString()}</div>
                    <div className="text-[0.65rem] text-white/50">Best: {player.highestScore.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-white/70">No leaderboard data available.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-0 px-4 pb-4">
        <Button
          variant="outline"
          size="sm"
          className="w-full border-[#9370DB]/30 text-white hover:bg-[#4B0082]/20 hover:text-white"
          asChild
        >
          <Link href="/leaderboard">
            View Full Leaderboard
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
