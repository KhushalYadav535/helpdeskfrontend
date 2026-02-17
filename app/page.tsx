"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { CheckCircle, Users, Zap, BarChart3, MessageSquare, Shield } from "lucide-react"

export default function Home() {
  const [email, setEmail] = useState("")

  const features = [
    {
      icon: Users,
      title: "Multi-Tenant Management",
      description: "Manage multiple tenants with complete data isolation and role-based access control",
    },
    {
      icon: MessageSquare,
      title: "Unified Ticketing",
      description: "Streamlined ticket management system with priority routing and automated assignment",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time dashboards and insights into support operations and team performance",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance built for high-volume support operations",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "End-to-end encryption and compliance with industry standards",
    },
  ]

  const stats = [
    { label: "Active Users", value: "10,000+" },
    { label: "Tickets Resolved", value: "500K+" },
    { label: "Avg Resolution", value: "2.5h" },
    { label: "Uptime", value: "99.9%" },
  ]

  return (
    <main className="min-h-screen bg-background" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-bold text-lg">RezolvX</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </a>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition">
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <p className="text-sm font-medium text-primary">Now with AI-powered ticket routing</p>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-balance">
            <span className="hero-word hero-word-1 text-foreground">Customer</span>{" "}
            <span className="hero-word hero-word-2 text-foreground">Support</span>{" "}
            <span className="hero-word hero-word-3">Built</span>{" "}
            <span className="hero-word hero-word-4">Better</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Enterprise-grade helpdesk system designed for teams that demand excellence. Manage multiple tenants,
            streamline workflows, and delight your customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center" suppressHydrationWarning>
                <div className="text-3xl font-extrabold text-foreground tracking-tight mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-balance">Everything you need to succeed</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help your team deliver exceptional customer support at scale.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-border/50 hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <Icon className="w-8 h-8 text-accent mb-2" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center text-balance">Built for every team</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Enterprises",
                description: "Multi-tenant architecture with advanced security and compliance features.",
                points: ["SSO Integration", "Custom Branding", "Audit Logs"],
              },
              {
                title: "Agencies",
                description: "Manage multiple client support operations from a single platform.",
                points: ["Client Isolation", "Billing per Tenant", "White Label"],
              },
              {
                title: "SaaS Companies",
                description: "Scalable support infrastructure that grows with your business.",
                points: ["API Access", "Webhooks", "Custom Fields"],
              },
            ].map((useCase) => (
              <Card key={useCase.title} className="border-border/50">
                <CardHeader>
                  <CardTitle>{useCase.title}</CardTitle>
                  <CardDescription>{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {useCase.points.map((point, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="text-sm">{point}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4 text-balance">Ready to transform your support?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of teams already using RezolvX to deliver world-class customer support.
          </p>
          <Link href="/signup">
            <Button size="lg">Start Your Free Trial</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 RezolvX. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
