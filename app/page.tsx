"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import {
  CheckCircle,
  Users,
  Zap,
  BarChart3,
  MessageSquare,
  Shield,
  ArrowRight,
  Sparkles,
  Globe,
  Headphones,
  ChevronRight,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Bot,
} from "lucide-react"

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Auto-rotate active feature
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Users,
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation per tenant with role-based access for Super Admin, Tenant Admin, Agent, and Customer roles.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconGradient: "from-blue-500 to-cyan-400",
    },
    {
      icon: MessageSquare,
      title: "Omnichannel Ticketing",
      description: "Accept tickets from WhatsApp, Telegram, Phone, Email, Contact Forms, and Chatbot — all in one unified inbox.",
      gradient: "from-violet-500/20 to-purple-500/20",
      iconGradient: "from-violet-500 to-purple-400",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Live dashboards with ticket stats, agent performance metrics, SLA compliance tracking, and resolution trends.",
      gradient: "from-emerald-500/20 to-green-500/20",
      iconGradient: "from-emerald-500 to-green-400",
    },
    {
      icon: Zap,
      title: "Smart Auto-Assignment",
      description: "Load-balanced agent assignment with priority detection from message content and escalation workflows.",
      gradient: "from-amber-500/20 to-orange-500/20",
      iconGradient: "from-amber-500 to-orange-400",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "JWT authentication, bcrypt password hashing, rate limiting, Helmet headers, and CORS protection built-in.",
      gradient: "from-rose-500/20 to-pink-500/20",
      iconGradient: "from-rose-500 to-pink-400",
    },
    {
      icon: Mail,
      title: "Email Automation",
      description: "Welcome emails, ticket notifications, password resets with beautiful HTML templates — all automated.",
      gradient: "from-indigo-500/20 to-blue-500/20",
      iconGradient: "from-indigo-500 to-blue-400",
    },
  ]

  const channels = [
    { icon: MessageCircle, label: "WhatsApp", color: "text-green-500" },
    { icon: MessageSquare, label: "Telegram", color: "text-blue-400" },
    { icon: Phone, label: "Phone/Voice", color: "text-amber-500" },
    { icon: Mail, label: "Email", color: "text-red-400" },
    { icon: Globe, label: "Contact Form", color: "text-cyan-500" },
    { icon: Bot, label: "Chatbot", color: "text-violet-500" },
  ]

  const stats = [
    { label: "Active Users", value: "10,000+", suffix: "" },
    { label: "Tickets Resolved", value: "500K+", suffix: "" },
    { label: "Avg Resolution", value: "2.5", suffix: "hrs" },
    { label: "Uptime", value: "99.9", suffix: "%" },
  ]

  const testimonials = [
    {
      quote: "RezolvX transformed how we handle support across all our clients. The multi-tenant setup is a game-changer.",
      name: "Priya Sharma",
      role: "VP of Operations",
      company: "TechScale Solutions",
    },
    {
      quote: "The omnichannel integration saved us hours daily. WhatsApp and Telegram tickets flow in seamlessly.",
      name: "Arjun Mehta",
      role: "Support Lead",
      company: "FinServ Global",
    },
    {
      quote: "Setting up took minutes, not days. The auto-assignment and escalation workflows are incredibly smart.",
      name: "Neha Gupta",
      role: "CTO",
      company: "CloudFirst India",
    },
  ]

  return (
    <main className="min-h-screen bg-background overflow-x-hidden" suppressHydrationWarning>
      {/* Animated background grid */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.35]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      {/* ─── Navigation ─── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Rezolv<span className="text-primary">X</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#channels" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Channels
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </a>
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Docs
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 sm:pt-40 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Helpdesk Platform</span>
            <ChevronRight className="h-3.5 w-3.5 text-primary/60" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.08] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <span className="hero-word hero-word-1 text-foreground">Customer</span>{" "}
            <span className="hero-word hero-word-2 text-foreground">Support</span>
            <br className="hidden sm:block" />{" "}
            <span className="hero-word hero-word-3">Built</span>{" "}
            <span className="hero-word hero-word-4">Better</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            Enterprise-grade multi-tenant helpdesk that unifies WhatsApp, Telegram, Phone, Email,
            and more into one powerful platform. Deploy in minutes, scale forever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12 bg-transparent backdrop-blur-sm hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
            <div className="flex -space-x-2">
              {["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500"].map((bg, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-background flex items-center justify-center text-white text-xs font-bold`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="ml-2">Trusted by <strong className="text-foreground">500+</strong> support teams worldwide</span>
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative group text-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                suppressHydrationWarning
              >
                <div className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-1">
                  {stat.value}
                  {stat.suffix && <span className="text-primary text-2xl sm:text-3xl">{stat.suffix}</span>}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-balance">
              Everything you need to{" "}
              <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">
                deliver excellence
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
              Powerful features designed for teams that demand enterprise-grade support at startup speed.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className={`group relative p-6 rounded-2xl border transition-all duration-300 cursor-default ${
                    activeFeature === i
                      ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10 scale-[1.02]"
                      : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 hover:bg-card/80 hover:shadow-md"
                  }`}
                  onMouseEnter={() => setActiveFeature(i)}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.iconGradient} flex items-center justify-center mb-4 shadow-lg ${
                    activeFeature === i ? "shadow-primary/20" : "shadow-black/5"
                  } transition-shadow`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>

                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Channels Section ─── */}
      <section id="channels" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <Headphones className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Omnichannel</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-balance">
              Every channel,{" "}
              <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">
                one inbox
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Customers reach out from everywhere. RezolvX brings them all together with smart routing and auto-assignment.
            </p>
          </div>

          {/* Channel cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {channels.map((channel) => {
              const Icon = channel.icon
              return (
                <div
                  key={channel.label}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Icon className={`h-7 w-7 ${channel.color} transition-transform group-hover:scale-110`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{channel.label}</span>
                </div>
              )
            })}
          </div>

          {/* Workflow illustration */}
          <div className="mt-16 p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Incoming
                </div>
                <h3 className="text-lg font-bold mb-2">Tickets arrive 24/7</h3>
                <p className="text-sm text-muted-foreground">From any channel, any time zone. Every message becomes an actionable ticket.</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-semibold">
                  <Zap className="h-3 w-3" />
                  Processing
                </div>
                <h3 className="text-lg font-bold mb-2">Smart auto-routing</h3>
                <p className="text-sm text-muted-foreground">Priority detection, tenant matching, load-balanced assignment — all automatic.</p>
              </div>
              <div className="text-center md:text-right">
                <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-semibold">
                  <CheckCircle className="h-3 w-3" />
                  Resolved
                </div>
                <h3 className="text-lg font-bold mb-2">Happy customers</h3>
                <p className="text-sm text-muted-foreground">Faster resolution, automated follow-ups, feedback collection built in.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Use Cases Section ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-balance">
              Built for{" "}
              <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">
                every team
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you&apos;re an enterprise, agency, or SaaS company — RezolvX scales with your support needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Enterprises",
                description: "Multi-tenant architecture with advanced security and compliance features for large organizations.",
                points: ["Role-Based Access Control", "Tenant Data Isolation", "Audit Activity Logs", "Custom Webhooks"],
                gradient: "from-blue-500 to-cyan-400",
              },
              {
                title: "Agencies",
                description: "Manage multiple client support operations from a single, unified dashboard.",
                points: ["Client Isolation", "Per-Tenant Settings", "White Label Ready", "Centralized Analytics"],
                gradient: "from-violet-500 to-purple-400",
                featured: true,
              },
              {
                title: "SaaS Companies",
                description: "Scalable support infrastructure with API-first design that grows with your product.",
                points: ["REST API Access", "Multi-Channel Webhooks", "Auto-Assignment", "Email Automation"],
                gradient: "from-emerald-500 to-green-400",
              },
            ].map((useCase) => (
              <div
                key={useCase.title}
                className={`relative p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  useCase.featured
                    ? "border-primary/40 bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20"
                }`}
              >
                {useCase.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-5 shadow-lg shadow-black/10`}>
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{useCase.description}</p>
                <div className="space-y-3">
                  {useCase.points.map((point) => (
                    <div key={point} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials Section ─── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Testimonials</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-balance">
              Loved by{" "}
              <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">
                support teams
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-bold">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <div className="relative z-10 text-center p-12 sm:p-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight text-balance">
                Ready to transform your support?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join hundreds of teams already using RezolvX to deliver world-class customer support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 h-12 bg-transparent text-white border-white/30 hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-md">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg">
                  Rezolv<span className="text-primary">X</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enterprise-grade multi-tenant helpdesk platform.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
              <div className="space-y-3">
                <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#channels" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Channels</a>
                <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</Link>
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <div className="space-y-3">
                <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
                <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
                <Link href="/careers" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
              <div className="space-y-3">
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2026 RezolvX. All rights reserved.</p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ by{" "}
              <a href="https://sentientdigital.in" target="_blank" rel="noopener noreferrer" className="text-foreground font-medium hover:text-primary transition-colors">Sentient Digital</a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
