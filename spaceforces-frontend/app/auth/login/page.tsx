"use client";

import ParticlesComponent from "@/components/LandingPageParticles";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/login";
import { useAuthStore } from "@/lib/store";
import type { DecodedToken } from "@/types";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    login(data)
      .then((response) => {
        toast.success("Login successful! Redirecting to home page...");
        const decodedToken = jwt.decode(response.token);
        document.cookie = `token=${response.token}; path=/; max-age=3600;`;
        //@ts-ignore
        setUser({
          id: (decodedToken as DecodedToken)?.userId,
          email: (decodedToken as DecodedToken)?.sub,
          isAdmin: (decodedToken as DecodedToken)?.isAdmin,
        });
        router.push("/");
      })
      .catch(() => {
        toast.error("Invalid credentials. Please try again.");
      });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white relative overflow-hidden">
      <ParticlesComponent id="tsparticles" />
      <div className="container relative z-10 mx-auto min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 bg-[#1a1a4f]/70 p-8 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <Rocket className="mx-auto h-12 w-12 text-purple-400" />
            <h2 className="mt-6 text-3xl font-bold">Welcome to SpaceForces """LOGIN PAGE"""</h2>
            <p className="mt-2 text-sm text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-[#2a2a6f]/50 border-purple-500/30"
                  {...register("email")}
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
              </div>

              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="bg-[#2a2a6f]/50 border-purple-500/30 pr-10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-purple-400 hover:text-purple-300">
                Create one now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
