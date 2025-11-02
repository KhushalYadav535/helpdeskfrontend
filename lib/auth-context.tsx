"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  role: "super-admin" | "tenant-admin" | "agent" | "customer"
  avatar?: string
  tenantId?: string
  companyName?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (data: any) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Get API URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const storedToken = localStorage.getItem("token")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      }
      if (storedToken) {
        setToken(storedToken)
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      // Call backend login API
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Login failed")
      }

      // Store user and token
      const userData = result.data
      const authToken = result.token

      setUser(userData)
      setToken(authToken)

      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", authToken)
      localStorage.setItem("userRole", userData.role) // For backward compatibility

      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      throw error
    }
  }, [API_URL])

  const signup = useCallback(async (data: any) => {
    setLoading(true)
    try {
      // Call backend register API
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name || data.fullName,
          email: data.email,
          password: data.password,
          role: "tenant-admin",
          companyName: data.companyName || data.name || data.fullName,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Signup failed")
      }

      // Store user and token
      const userData = result.data
      const authToken = result.token

      setUser(userData)
      setToken(authToken)

      localStorage.setItem("user", JSON.stringify(userData))
      localStorage.setItem("token", authToken)
      localStorage.setItem("userRole", userData.role) // For backward compatibility

      setLoading(false)
    } catch (error: any) {
      setLoading(false)
      throw error
    }
  }, [API_URL])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("userRole")
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        signup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
