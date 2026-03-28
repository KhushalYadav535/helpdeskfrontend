import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Sparkles, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service – RezolvX",
  description: "RezolvX terms of service — rules and guidelines for using our platform.",
}

export default function TermsPage() {
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: March 28, 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using RezolvX (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              RezolvX is a multi-tenant helpdesk management platform that enables organizations to manage customer support tickets, agents, and communication channels. The Service is provided by Sentient Digital.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Multi-Tenant Usage</h2>
            <p className="text-muted-foreground leading-relaxed">
              Each tenant organization is responsible for its own data, users, and agents. Tenant administrators are responsible for managing access within their organization. You agree not to attempt to access data belonging to other tenants.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service to transmit spam, harass others, distribute malware, violate any applicable laws, or attempt to gain unauthorized access to any part of the Service or its related systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service, its original content, features, and functionality remain the exclusive property of Sentient Digital. The Service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall RezolvX, its directors, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the &quot;Last updated&quot; date. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at{" "}
              <a href="mailto:legal@sentientdigital.in" className="text-primary hover:underline">legal@sentientdigital.in</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
