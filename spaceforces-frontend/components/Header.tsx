"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Rocket, Menu, X, Sparkles, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-black/40 border-b border-[#9370DB]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
              <div className="relative">
                <Rocket className="h-8 w-8 text-[#E6E6FA] rotate-45" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="h-4 w-4 text-[#E6E6FA]" />
                </div>
              </div>
              <span className="bg-gradient-to-r from-[#9370DB] via-[#BA55D3] to-[#E6E6FA] bg-clip-text text-transparent">
                Spaceforces
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium text-white/70 hover:text-white">
                Home
              </Link>
              <Link href="/my-quizzes" className="text-sm font-medium text-white/70 hover:text-white">
                My Quizzes
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium text-white/70 hover:text-white">
                Leaderboard
              </Link>
              <Link href="/news" className="text-sm font-medium text-white/70 hover:text-white">
                News
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user?.isAdmin ? <Button className="hidden md:flex bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]" asChild>
              <Link href="/create-quiz">
                <Rocket className="mr-2 h-4 w-4" />
                Create Quiz
              </Link>
            </Button> : null}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 border border-[#9370DB]/50 cursor-pointer">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1a1a4f]/90 border-[#9370DB]/30 backdrop-blur-sm">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center text-white/70 hover:text-white">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-[#4B0082]/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#9370DB]/30 bg-black/80 backdrop-blur-md">
          <div className="px-4 py-4 space-y-4 max-w-7xl mx-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Search space quizzes..."
                className="w-full rounded-lg pl-8 bg-[#4B0082]/30 border-[#9370DB]/30 text-white placeholder:text-white/50"
              />
            </div>
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="text-sm font-medium text-white/70 hover:text-white px-2 py-1">
                Home
              </Link>
              <Link href="/my-quizzes" className="text-sm font-medium text-white/70 hover:text-white px-2 py-1">
                My Quizzes
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium text-white/70 hover:text-white px-2 py-1">
                Leaderboard
              </Link>
              <Link href="/profile" className="text-sm font-medium text-white/70 hover:text-white px-2 py-1">
                Profile
              </Link>
            </nav>
            <Button className="w-full bg-[#6A0DAD] hover:bg-[#6A0DAD]/80 text-[#E6E6FA]" asChild>
              <Link href="/create-quiz">
                <Rocket className="mr-2 h-4 w-4" />
                Create Quiz
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
