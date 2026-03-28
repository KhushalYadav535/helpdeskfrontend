import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Sparkles, ArrowLeft, Calendar } from "lucide-react"

export const metadata = {
  title: "Blog – RezolvX",
  description: "Latest news, updates, and insights from the RezolvX team.",
}

const posts = [
  {
    title: "Introducing Omnichannel Support: WhatsApp, Telegram & More",
    excerpt: "We're excited to announce built-in support for 6 communication channels, all flowing into one unified inbox.",
    date: "March 15, 2026",
    tag: "Product Update",
    tagColor: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "How Multi-Tenant Architecture Powers Enterprise Support",
    excerpt: "A deep dive into how RezolvX isolates tenant data while keeping operations seamless across organizations.",
    date: "March 8, 2026",
    tag: "Engineering",
    tagColor: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Auto-Assignment: Smart Ticket Routing Explained",
    excerpt: "Learn how our load-balanced agent assignment and priority detection algorithms work behind the scenes.",
    date: "February 28, 2026",
    tag: "Feature",
    tagColor: "bg-violet-500/10 text-violet-500",
  },
  {
    title: "Building a Helpdesk That Scales: Our Tech Stack",
    excerpt: "From Express.js and MongoDB on the backend to Next.js 16 and React 19 on the frontend — here's how we built RezolvX.",
    date: "February 20, 2026",
    tag: "Engineering",
    tagColor: "bg-emerald-500/10 text-emerald-500",
  },
]

export default function BlogPage() {
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
          <span className="text-transparent bg-gradient-to-r from-primary to-blue-400 bg-clip-text">Blog</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-12">Latest news, updates, and insights from the RezolvX team.</p>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.title}
              className="group p-6 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.tagColor}`}>{post.tag}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}
