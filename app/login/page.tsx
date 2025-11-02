"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login, loading } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await login(email, password)
      // Get user from localStorage to redirect to correct dashboard
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        // Redirect based on user role
        if (user.role === "super-admin") {
          router.push("/dashboard/super-admin")
        } else if (user.role === "tenant-admin") {
          router.push("/dashboard/tenant-admin")
        } else if (user.role === "agent") {
          router.push("/dashboard/agent")
        } else {
          router.push("/dashboard/customer")
        }
      } else {
        router.push("/dashboard/customer")
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-bold text-lg">Helpdesk Pro</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-accent hover:text-accent/80">
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" disabled>
                Google
              </Button>
              <Button variant="outline" disabled>
                GitHub
              </Button>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-accent font-medium hover:text-accent/80">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground mb-3">Try demo accounts:</p>
          <div className="space-y-2 text-xs">
            <div>
              <p className="font-medium text-foreground">Super Admin</p>
              <p className="text-muted-foreground">admin@helpdesk.com / demo123</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Tenant Admin</p>
              <p className="text-muted-foreground">tenant@helpdesk.com / demo123</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Agent</p>
              <p className="text-muted-foreground">agent@helpdesk.com / demo123</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Customer</p>
              <p className="text-muted-foreground">customer@helpdesk.com / demo123</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
