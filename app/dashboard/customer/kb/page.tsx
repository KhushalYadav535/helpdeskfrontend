"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Ticket, Plus, AlertCircle, Settings, Search, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function KnowledgeBasePage() {
  const sidebarItems = [
    { label: "My Tickets", href: "/dashboard/customer", icon: <Ticket className="h-5 w-5" /> },
    { label: "Submit Ticket", href: "/dashboard/customer/new", icon: <Plus className="h-5 w-5" /> },
    { label: "Knowledge Base", href: "/dashboard/customer/kb", icon: <AlertCircle className="h-5 w-5" /> },
    { label: "Settings", href: "/dashboard/customer/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  const [searchQuery, setSearchQuery] = useState("")

  const articles = [
    {
      category: "Getting Started",
      items: [
        { title: "How to create an account", views: 1203 },
        { title: "Setting up your profile", views: 856 },
        { title: "First steps guide", views: 742 },
      ],
    },
    {
      category: "Account & Billing",
      items: [
        { title: "How to update billing information", views: 1456 },
        { title: "Understanding your invoice", views: 923 },
        { title: "Subscription plans explained", views: 2134 },
        { title: "How to cancel your subscription", views: 1876 },
      ],
    },
    {
      category: "Technical Support",
      items: [
        { title: "Troubleshooting login issues", views: 2456 },
        { title: "API integration guide", views: 1234 },
        { title: "Sync problems and solutions", views: 876 },
        { title: "Mobile app features", views: 1542 },
      ],
    },
    {
      category: "Features & Usage",
      items: [
        { title: "Understanding dashboard widgets", views: 1023 },
        { title: "Exporting data guide", views: 742 },
        { title: "Advanced search features", views: 634 },
        { title: "Custom reports tutorial", views: 589 },
      ],
    },
  ]

  const filteredArticles = articles.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase())),
  }))

  return (
    <DashboardLayout
      sidebarTitle="Customer Portal"
      sidebarItems={sidebarItems}
      userRole="customer"
      userName="John Doe"
      notificationCount={1}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">Browse articles and find solutions</p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Article Categories */}
        {filteredArticles.map((section) =>
          section.items.length > 0 ? (
            <Card key={section.category}>
              <CardHeader>
                <CardTitle className="text-lg">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items.map((article) => (
                    <button
                      key={article.title}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{article.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{article.views} views</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null,
        )}

        {/* No Results */}
        {searchQuery && filteredArticles.every((section) => section.items.length === 0) && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No articles found for "{searchQuery}"</p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
