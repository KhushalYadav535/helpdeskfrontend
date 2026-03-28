import Link from "next/link"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Sparkles, ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Privacy Policy – RezolvX",
  description: "RezolvX privacy policy — how we collect, use, and protect your data.",
}

export default function PrivacyPolicyPage() {
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

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: March 28, 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, such as your name, email address, company name, and any other information you choose to provide when creating an account, submitting support tickets, or contacting us. We also collect usage data automatically, including IP addresses, browser type, and interaction logs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send notifications and alerts, respond to support requests, and communicate with you about products, features, and events.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Data Isolation & Multi-Tenancy</h2>
            <p className="text-muted-foreground leading-relaxed">
              RezolvX is designed as a multi-tenant platform. Each tenant&apos;s data is logically isolated from other tenants. Tenant administrators can only access data belonging to their own organization. Super administrators have platform-level access for management purposes only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures including JWT authentication, bcrypt password hashing, HTTPS encryption, rate limiting, and security headers (Helmet). All passwords are stored using one-way cryptographic hashes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide you services. If you wish to delete your account, please contact your tenant administrator or our support team.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use third-party services such as MongoDB Atlas for database hosting, SMTP providers for email delivery, and analytics providers. These services have their own privacy policies governing the use of data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@sentientdigital.in" className="text-primary hover:underline">privacy@sentientdigital.in</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
