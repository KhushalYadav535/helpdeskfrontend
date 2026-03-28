"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  ArrowLeft,
  Mail,
  MessageCircle,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ExternalLink,
  Clock,
  FileText,
  Headphones,
} from "lucide-react"

const faqs = [
  {
    q: "How do I create a new ticket?",
    a: "Tickets can be created through multiple channels — WhatsApp, Telegram, Phone, Email, Contact Form, or the built-in Chatbot. Each message automatically creates a ticket and assigns it to an available agent.",
  },
  {
    q: "How does multi-tenant isolation work?",
    a: "Each tenant's data is completely isolated at the database level using tenant IDs. Users can only access data belonging to their own organization. Super Admins have platform-level access for management purposes.",
  },
  {
    q: "Can I change my assigned role?",
    a: "Roles (Agent, Supervisor, Tenant Admin) are managed by your Tenant Admin. Contact your organization's admin to request a role change.",
  },
  {
    q: "How does auto-assignment work?",
    a: "RezolvX uses load-balanced assignment — tickets are routed to available agents based on their current workload and the ticket's priority level. High-priority tickets trigger escalation workflows.",
  },
  {
    q: "What channels are supported for ticket creation?",
    a: "We support 6 channels: WhatsApp, Telegram, Phone/Voice, Email, Website Contact Forms, and our built-in Chatbot widget. All channels feed into one unified inbox.",
  },
  {
    q: "How do I reset my password?",
    a: "Click 'Forgot password?' on the login page and enter your email. You'll receive a password reset link sent to your registered email address.",
  },
]

export default function HelpSupportPage() {
  const router = useRouter()
  return (
    <main className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg">Rezolv<span className="text-primary">X</span></span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Help &{" "}
          <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">Support</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          Need help? Browse our FAQs, explore documentation, or reach out to our support team.
        </p>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-16">
          {[
            {
              icon: Mail,
              title: "Email Support",
              description: "Get a response within 24 hours",
              action: "support@sentientdigital.in",
              href: "mailto:support@sentientdigital.in",
              gradient: "from-blue-500 to-cyan-400",
            },
            {
              icon: MessageCircle,
              title: "Live Chat",
              description: "Available Mon–Fri, 9 AM – 6 PM IST",
              action: "Start a chat",
              href: "#",
              gradient: "from-violet-500 to-purple-400",
            },
            {
              icon: BookOpen,
              title: "Documentation",
              description: "Guides, API reference, tutorials",
              action: "Browse docs",
              href: "/docs",
              gradient: "from-emerald-500 to-green-400",
            },
          ].map((card) => {
            const Icon = card.icon
            return (
              <a
                key={card.title}
                href={card.href}
                className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg shadow-black/10`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors">{card.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{card.description}</p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  {card.action}
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </a>
            )
          })}
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {[
            { icon: Headphones, label: "Getting Started Guide", desc: "New to RezolvX? Start here.", href: "/docs" },
            { icon: FileText, label: "API Reference", desc: "Integrate with our REST API.", href: "/docs" },
            { icon: HelpCircle, label: "Troubleshooting", desc: "Common issues and solutions.", href: "#faqs" },
            { icon: Clock, label: "System Status", desc: "Check uptime and incidents.", href: "#" },
          ].map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 hover:bg-card/80 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
              </a>
            )
          })}
        </div>

        {/* FAQs */}
        <div id="faqs">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-colors [&[open]]:border-primary/30 [&[open]]:bg-primary/5"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-foreground">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90 flex-shrink-0 ml-4" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Still need help CTA */}
        <div className="mt-16 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
          <p className="text-muted-foreground mb-6">Our support team is here to assist you. Reach out and we'll get back to you quickly.</p>
          <a href="mailto:support@sentientdigital.in">
            <Button size="lg">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </a>
        </div>
      </div>
    </main>
  )
}
