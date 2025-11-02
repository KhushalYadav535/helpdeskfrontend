"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Book, 
  Rocket, 
  Settings, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Shield, 
  Code, 
  FileText,
  ArrowLeft,
  CheckCircle,
  Zap
} from "lucide-react"

export default function DocsPage() {
  const quickStart = [
    {
      step: 1,
      title: "Sign Up",
      description: "Create your account and set up your organization",
    },
    {
      step: 2,
      title: "Configure Tenant",
      description: "Set up your tenant settings and invite team members",
    },
    {
      step: 3,
      title: "Create Tickets",
      description: "Start managing support tickets right away",
    },
    {
      step: 4,
      title: "Customize",
      description: "Tailor the system to match your workflow",
    },
  ]

  const docsSections = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "Learn the basics and get up and running quickly",
      topics: ["Installation", "Initial Setup", "First Ticket", "User Roles"],
    },
    {
      icon: Settings,
      title: "Configuration",
      description: "Configure your helpdesk to match your needs",
      topics: ["Tenant Settings", "User Management", "Custom Fields", "Automation"],
    },
    {
      icon: MessageSquare,
      title: "Ticketing System",
      description: "Master ticket management and workflows",
      topics: ["Creating Tickets", "Assignments", "Priorities", "Status Workflows"],
    },
    {
      icon: Users,
      title: "User Management",
      description: "Manage users, roles, and permissions",
      topics: ["Roles & Permissions", "Team Management", "Access Control", "SSO Setup"],
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track performance and generate insights",
      topics: ["Dashboards", "Custom Reports", "Metrics", "Export Data"],
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Security features and compliance guidelines",
      topics: ["Data Encryption", "Audit Logs", "GDPR Compliance", "API Security"],
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Integrate with our REST API",
      topics: ["Authentication", "Endpoints", "Webhooks", "Rate Limits"],
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
            <span className="font-bold text-lg">Helpdesk Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition">
              Home
            </Link>
            <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition">
              Features
            </Link>
            <Link href="/docs" className="text-sm font-medium text-foreground">
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-3">
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
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <p className="text-sm font-medium text-primary">Documentation</p>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 text-balance">
            Helpdesk Pro{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Documentation
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Everything you need to know to get the most out of Helpdesk Pro. From getting started to advanced configurations.
          </p>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card/30 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Quick Start</h2>
            <p className="text-muted-foreground">Get up and running in minutes</p>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {quickStart.map((item) => (
              <Card key={item.step} className="border-border/50">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-primary font-bold">{item.step}</span>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-balance">Documentation</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our comprehensive guides and resources
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docsSections.map((section, i) => {
              const Icon = section.icon
              return (
                <Card key={i} className="border-border/50 hover:border-accent/50 transition-colors">
                  <CardHeader>
                    <Icon className="w-8 h-8 text-accent mb-2" />
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.topics.map((topic, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-balance">Popular Articles</h2>
            <p className="text-lg text-muted-foreground">Most viewed documentation pages</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Setting Up Your First Tenant",
                description: "Learn how to configure a tenant and invite team members",
                icon: Settings,
              },
              {
                title: "Creating and Managing Tickets",
                description: "Complete guide to the ticketing system and workflows",
                icon: MessageSquare,
              },
              {
                title: "API Integration Guide",
                description: "Connect your application using our REST API",
                icon: Code,
              },
            ].map((article, i) => {
              const Icon = article.icon
              return (
                <Card key={i} className="border-border/50 hover:border-accent/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <Icon className="w-6 h-6 text-accent mb-2" />
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription>{article.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-12">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4 text-balance">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start using Helpdesk Pro today and transform your customer support experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="bg-transparent">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Helpdesk Pro. All rights reserved.
            </p>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

