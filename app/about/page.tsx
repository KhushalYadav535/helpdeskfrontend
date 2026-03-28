import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Sparkles, Users, Target, Heart, ArrowRight, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "About Us – RezolvX",
  description: "Learn about RezolvX, the enterprise-grade multi-tenant helpdesk platform built by Sentient Digital.",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
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
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          About <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">RezolvX</span>
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed mb-12">
          RezolvX is an enterprise-grade, multi-tenant helpdesk management system designed to unify customer support across every channel. Built by{" "}
          <a href="https://sentientdigital.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
            Sentient Digital
          </a>, we empower support teams to deliver world-class experiences.
        </p>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Target, title: "Our Mission", text: "To make world-class customer support accessible to every business, regardless of size." },
            { icon: Heart, title: "Our Values", text: "Customer-first thinking, transparency, continuous improvement, and engineering excellence." },
            { icon: Users, title: "Our Team", text: "A passionate team of engineers, designers, and support professionals based in India." },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.title} className="p-6 rounded-2xl border border-border/50 bg-card/50">
                <Icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-3">Want to learn more?</h2>
          <p className="text-muted-foreground mb-6">Get in touch with our team or start your free trial today.</p>
          <Link href="/signup">
            <Button size="lg">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
