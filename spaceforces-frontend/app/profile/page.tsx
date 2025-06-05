"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, Settings, Trophy, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { getUserInfo } from "@/services/getUserInfo";
import { User as UserType } from "@/types";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const userData = await getUserInfo(token);
          setUserInfo(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        toast.error("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    logout();
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a2e] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const displayUser = userInfo || user;

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-[#0a0a2e] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No user data found</h1>
          <Button onClick={() => router.push("/auth/login")} className="bg-purple-600 hover:bg-purple-700">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#9370DB] via-[#BA55D3] to-[#E6E6FA] bg-clip-text text-transparent">
              My Profile
            </h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Profile Card */}
          <Card className="bg-[#1a1a4f]/70 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-2 border-purple-400">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" alt={displayUser.username} />
                  <AvatarFallback className="bg-purple-600 text-white text-xl">
                    {displayUser.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-white">{displayUser.username}</CardTitle>
                  <p className="text-gray-400">{displayUser.email}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    {displayUser.isAdmin && (
                      <Badge className="bg-yellow-600 hover:bg-yellow-700">
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                    {displayUser.rank && (
                      <Badge className="bg-purple-600 hover:bg-purple-700">
                        <Star className="mr-1 h-3 w-3" />
                        {displayUser.rank.title}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#2a2a6f]/50 rounded-lg p-4 text-center">
                  <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{displayUser.points}</p>
                  <p className="text-gray-400">Points</p>
                </div>
                
                <div className="bg-[#2a2a6f]/50 rounded-lg p-4 text-center">
                  <Star className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {displayUser.rank?.title || "No Rank"}
                  </p>
                  <p className="text-gray-400">Current Rank</p>
                </div>

                <div className="bg-[#2a2a6f]/50 rounded-lg p-4 text-center">
                  <User className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">
                    {displayUser.isAdmin ? "Admin" : "User"}
                  </p>
                  <p className="text-gray-400">Role</p>
                </div>
              </div>

              {/* Description */}
              {displayUser.description && (
                <div className="bg-[#2a2a6f]/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                  <p className="text-gray-300">{displayUser.description}</p>
                </div>
              )}

              {/* Rank Progress */}
              {displayUser.rank && (
                <div className="bg-[#2a2a6f]/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Rank Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {displayUser.rank.title} ({displayUser.rank.abbreviation})
                      </span>
                      <span className="text-gray-400">
                        {displayUser.points} / {displayUser.rank.maxPoints || "Max"} points
                      </span>
                    </div>
                    {displayUser.rank.maxPoints && (
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              ((displayUser.points - displayUser.rank.minPoints) /
                                (displayUser.rank.maxPoints - displayUser.rank.minPoints)) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/my-quizzes")}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  My Quizzes
                </Button>
                <Button
                  onClick={() => router.push("/leaderboard")}
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Leaderboard
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
