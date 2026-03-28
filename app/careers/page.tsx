import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Sparkles, ArrowLeft, ArrowRight, MapPin, Briefcase } from "lucide-react"

export const metadata = {
  title: "Careers – RezolvX",
  description: "Join the RezolvX team and help us build the future of customer support.",
}

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    type: "Full-time",
    location: "Remote / India",
    description: "Build and scale our multi-tenant helpdesk platform using Next.js, Express.js, and MongoDB.",
  },
  {
    title: "Product Designer (UI/UX)",
    type: "Full-time",
    location: "Remote / India",
    description: "Design intuitive dashboards and workflows that delight support teams and their customers.",
  },
  {
    title: "DevOps Engineer",
    type: "Full-time",
    location: "Remote",
    description: "Manage our cloud infrastructure, CI/CD pipelines, and ensure 99.9% uptime.",
  },
  {
    title: "Customer Success Manager",
    type: "Full-time",
    location: "India",
    description: "Help our enterprise customers get the most out of RezolvX with onboarding, training, and support.",
  },
]

export default function CareersPage() {
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
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Join{" "}
          <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">RezolvX</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-12">
          We&apos;re building the future of customer support. Come build it with us.
        </p>

        {/* Open positions */}
        <h2 className="text-2xl font-bold mb-6">Open Positions</h2>
        <div className="space-y-4 mb-16">
          {openings.map((job) => (
            <div
              key={job.title}
              className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.type}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{job.description}</p>
                </div>
                <Button variant="outline" size="sm" className="flex-shrink-0 self-start sm:self-center">
                  Apply <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-3">Don&apos;t see a fit?</h2>
          <p className="text-muted-foreground mb-6">Send us your resume anyway — we&apos;re always looking for talented people.</p>
          <a href="mailto:careers@sentientdigital.in">
            <Button size="lg">
              Send Resume <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </main>
  )
}
