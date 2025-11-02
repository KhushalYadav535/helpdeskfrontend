"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { BarChart3, TrendingUp, PieChartIcon, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function ReportsPage() {
  const sidebarItems = [{ label: "Reports", href: "/dashboard/reports", icon: <BarChart3 className="h-5 w-5" /> }]

  const ticketTrendData = [
    { month: "Jan", created: 65, resolved: 45, pending: 20 },
    { month: "Feb", created: 78, resolved: 52, pending: 26 },
    { month: "Mar", created: 82, resolved: 60, pending: 22 },
    { month: "Apr", created: 95, resolved: 70, pending: 25 },
    { month: "May", created: 110, resolved: 85, pending: 25 },
    { month: "Jun", created: 125, resolved: 98, pending: 27 },
  ]

  const priorityData = [
    { name: "Critical", value: 12, color: "#ef4444" },
    { name: "High", value: 28, color: "#f97316" },
    { name: "Medium", value: 45, color: "#eab308" },
    { name: "Low", value: 15, color: "#22c55e" },
  ]

  const agentPerformanceData = [
    { agent: "Alice", resolved: 156, satisfaction: 4.8, sla: 98 },
    { agent: "Bob", resolved: 142, satisfaction: 4.7, sla: 96 },
    { agent: "Carol", resolved: 138, satisfaction: 4.6, sla: 94 },
    { agent: "David", resolved: 124, satisfaction: 4.5, sla: 92 },
  ]

  const categoryData = [
    { category: "Technical", tickets: 245, avgTime: "2.3h" },
    { category: "Billing", tickets: 128, avgTime: "1.5h" },
    { category: "Feature", tickets: 92, avgTime: "4.2h" },
    { category: "Bug", tickets: 156, avgTime: "3.1h" },
  ]

  return (
    <DashboardLayout
      sidebarTitle="Analytics"
      sidebarItems={sidebarItems}
      userRole="agent"
      userName="Reports"
      notificationCount={0}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
            <p className="text-muted-foreground mt-2">System performance and team metrics</p>
          </div>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <BarChart3 className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">621</div>
              <p className="text-xs text-muted-foreground">+12% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">410</div>
              <p className="text-xs text-muted-foreground">66% resolution rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3h</div>
              <p className="text-xs text-muted-foreground">Within SLA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <PieChartIcon className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7 ⭐</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Trends</CardTitle>
            <CardDescription>Created, resolved, and pending tickets over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets by Priority</CardTitle>
              <CardDescription>Current distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformanceData.map((agent) => (
                  <div key={agent.agent} className="space-y-2">
                    <div className="flex justify-between">
                      <p className="font-medium">{agent.agent}</p>
                      <p className="text-sm text-muted-foreground">{agent.satisfaction} ⭐</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">Resolved: {agent.resolved}</p>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(agent.resolved / 156) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <p className="text-xs font-medium">{agent.sla}% SLA</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
            <CardDescription>Tickets and resolution time by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tickets" fill="#3b82f6" name="Total Tickets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
