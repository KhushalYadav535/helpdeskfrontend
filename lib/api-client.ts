// API client for mock data operations
// In a real app, this would make actual API calls

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// Simulated delay for API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Auto-assign agent based on tenant and availability
async function autoAssignAgent(tenantId: number): Promise<string | null> {
  const { mockData } = await import("./mock-data")
  
  // Get all agents for this tenant
  const tenantAgents = mockData.agents.filter((a: any) => a.tenantId === tenantId)
  
  if (tenantAgents.length === 0) {
    return null
  }
  
  // Filter online/available agents (exclude offline)
  const availableAgents = tenantAgents.filter((a: any) => a.status === "online" || a.status === "away")
  
  if (availableAgents.length === 0) {
    // If no online agents, assign to any agent
    const agent = tenantAgents[0]
    return agent.name
  }
  
  // Get current ticket counts for load balancing
  const ticketCounts: Record<number, number> = {}
  mockData.tickets.forEach((t: any) => {
    if (t.tenantId === tenantId && t.status !== "Resolved") {
      tenantAgents.forEach((agent: any) => {
        if (t.agent === agent.name) {
          ticketCounts[agent.id] = (ticketCounts[agent.id] || 0) + 1
        }
      })
    }
  })
  
  // Assign to agent with least tickets (round-robin with load balancing)
  let selectedAgent = availableAgents[0]
  let minTickets = ticketCounts[selectedAgent.id] || 0
  
  for (const agent of availableAgents) {
    const count = ticketCounts[agent.id] || 0
    if (count < minTickets) {
      minTickets = count
      selectedAgent = agent
    }
  }
  
  return selectedAgent.name
}

// Detect tenant from webhook token
export async function detectTenantFromToken(token: string): Promise<number | null> {
  const { mockData } = await import("./mock-data")
  
  const tenant = mockData.tenants.find((t: any) => t.webhookToken === token)
  return tenant ? tenant.id : null
}

// Detect tenant from channel/phone number
export async function detectTenantFromChannel(channel: string, identifier: string): Promise<number | null> {
  const { mockData } = await import("./mock-data")
  
  // Normalize identifier
  const normalizedId = identifier.trim().toLowerCase()
  
  // Search through tenant channels
  for (const tenant of mockData.tenants) {
    if (!tenant.channels) continue
    
    const channels = tenant.channels as any
    
    switch (channel.toLowerCase()) {
      case "whatsapp":
      case "phone":
        // Match phone numbers (with or without +, spaces, dashes)
        const tenantPhone = channels.whatsapp || channels.phone
        if (tenantPhone && normalizePhone(tenantPhone) === normalizePhone(normalizedId)) {
          return tenant.id
        }
        break
        
      case "telegram":
        if (channels.telegram && channels.telegram.toLowerCase() === normalizedId) {
          return tenant.id
        }
        break
        
      case "email":
        // Extract domain from email or match full email
        if (channels.email && (channels.email.toLowerCase() === normalizedId || 
            channels.email.toLowerCase().split("@")[1] === normalizedId.split("@")[1])) {
          return tenant.id
        }
        break
        
      case "contact-form":
      case "chatbot":
        // These might need tenantId in webhook payload or URL params
        // For now, return null and require explicit tenantId
        break
    }
  }
  
  return null
}

// Normalize phone number for comparison
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, "").replace(/^91/, "").replace(/^0/, "")
}

// Tenant API
export const tenantAPI = {
  async getAll(): Promise<APIResponse<any[]>> {
    await delay(300)
    const { mockData } = await import("./mock-data")
    return {
      success: true,
      data: mockData.tenants,
    }
  },

  async getById(id: number): Promise<APIResponse<any>> {
    await delay(200)
    const { mockData } = await import("./mock-data")
    const tenant = mockData.tenants.find((t: any) => t.id === id)
    return {
      success: !!tenant,
      data: tenant,
      error: tenant ? undefined : "Tenant not found",
    }
  },

  async create(data: any): Promise<APIResponse<any>> {
    await delay(400)
    // Generate unique webhook token for new tenant
    const webhookToken = `wh_tenant_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    const newTenant = { 
      id: Date.now(), 
      ...data, 
      status: "active",
      webhookToken,
    }
    
    // Add to mock data
    const { mockData } = await import("./mock-data")
    mockData.tenants.push(newTenant)
    
    return {
      success: true,
      data: newTenant,
    }
  },

  async update(id: number, data: any): Promise<APIResponse<any>> {
    await delay(300)
    return {
      success: true,
      data: { id, ...data },
    }
  },

  async delete(id: number): Promise<APIResponse<void>> {
    await delay(300)
    return {
      success: true,
    }
  },
}

// Agent API
export const agentAPI = {
  async getAll(tenantId?: number): Promise<APIResponse<any[]>> {
    await delay(300)
    const { mockData } = await import("./mock-data")
    let agents = mockData.agents
    if (tenantId) {
      agents = agents.filter((a: any) => a.tenantId === tenantId)
    }
    return {
      success: true,
      data: agents,
    }
  },

  async getById(id: number): Promise<APIResponse<any>> {
    await delay(200)
    const { mockData } = await import("./mock-data")
    const agent = mockData.agents.find((a: any) => a.id === id)
    return {
      success: !!agent,
      data: agent,
      error: agent ? undefined : "Agent not found",
    }
  },

  async create(data: any): Promise<APIResponse<any>> {
    await delay(400)
    const newAgent = { id: Date.now(), ...data, status: "offline", resolved: 0 }
    return {
      success: true,
      data: newAgent,
    }
  },

  async update(id: number, data: any): Promise<APIResponse<any>> {
    await delay(300)
    return {
      success: true,
      data: { id, ...data },
    }
  },

  async delete(id: number): Promise<APIResponse<void>> {
    await delay(300)
    return {
      success: true,
    }
  },
}

// Ticket API
export const ticketAPI = {
  async getAll(filters?: any): Promise<APIResponse<any[]>> {
    await delay(400)
    const { mockData } = await import("./mock-data")
    let tickets = mockData.tickets

    if (filters?.status) {
      tickets = tickets.filter((t: any) => t.status === filters.status)
    }
    if (filters?.priority) {
      tickets = tickets.filter((t: any) => t.priority === filters.priority)
    }
    if (filters?.tenant) {
      tickets = tickets.filter((t: any) => t.tenant === filters.tenant)
    }
    if (filters?.tenantId) {
      tickets = tickets.filter((t: any) => t.tenantId === filters.tenantId)
    }

    return {
      success: true,
      data: tickets,
    }
  },

  async getById(id: string): Promise<APIResponse<any>> {
    await delay(200)
    const { mockData } = await import("./mock-data")
    const ticket = mockData.tickets.find((t: any) => t.id === id)
    return {
      success: !!ticket,
      data: ticket,
      error: ticket ? undefined : "Ticket not found",
    }
  },

  async create(data: any): Promise<APIResponse<any>> {
    await delay(500)
    const ticketId = `TKT-${Date.now().toString().slice(-4)}`
    
    // Auto-assign agent if tenantId provided
    let assignedAgent = data.agent
    if (data.tenantId && !data.agent) {
      const assigned = await autoAssignAgent(data.tenantId)
      assignedAgent = assigned || "Unassigned"
    }
    
    const newTicket = {
      id: ticketId,
      ...data,
      status: "Open",
      created: new Date().toISOString().split("T")[0],
      updated: new Date().toISOString().split("T")[0],
      responses: 0,
      tenantId: data.tenantId,
      agent: assignedAgent || data.agent || "Unassigned",
      source: data.source || "web", // whatsapp, telegram, phone, contact-form, chatbot, email
      channel: data.channel || data.source || "web",
    }
    
    // Add to mock data
    const { mockData } = await import("./mock-data")
    mockData.tickets.push(newTicket)
    
    return {
      success: true,
      data: newTicket,
    }
  },

  async update(id: string, data: any): Promise<APIResponse<any>> {
    await delay(300)
    return {
      success: true,
      data: { id, ...data },
    }
  },

  async updateStatus(id: string, status: string): Promise<APIResponse<any>> {
    await delay(300)
    return {
      success: true,
      data: { id, status },
    }
  },

  async delete(id: string): Promise<APIResponse<void>> {
    await delay(300)
    return {
      success: true,
    }
  },
}

// Customer API
export const customerAPI = {
  async getAll(tenantId?: number): Promise<APIResponse<any[]>> {
    await delay(300)
    const { mockData } = await import("./mock-data")
    let customers = mockData.customers
    
    if (tenantId) {
      customers = customers.filter((c: any) => c.tenantId === tenantId)
    }
    
    return {
      success: true,
      data: customers,
    }
  },

  async getById(id: number): Promise<APIResponse<any>> {
    await delay(200)
    const { mockData } = await import("./mock-data")
    const customer = mockData.customers.find((c: any) => c.id === id)
    return {
      success: !!customer,
      data: customer,
      error: customer ? undefined : "Customer not found",
    }
  },
}

// Analytics API
export const analyticsAPI = {
  async getTenantStats(): Promise<APIResponse<any>> {
    await delay(500)
    const { mockData } = await import("./mock-data")
    return {
      success: true,
      data: {
        activeTenants: mockData.tenants.length,
        totalAgents: mockData.agents.length,
        totalTickets: mockData.tickets.length,
        avgResponseTime: "3.2h",
      },
    }
  },

  async getAgentPerformance(agentId: number): Promise<APIResponse<any>> {
    await delay(400)
    const { mockData } = await import("./mock-data")
    const agent = mockData.agents.find((a: any) => a.id === agentId)
    if (!agent) {
      return {
        success: false,
        error: "Agent not found",
      }
    }
    return {
      success: true,
      data: {
        agentId,
        resolved: agent.resolved,
        satisfaction: agent.satisfaction,
        responseTime: "2.3h",
        slcCompliance: "98%",
      },
    }
  },

  async getTicketStats(): Promise<APIResponse<any>> {
    await delay(500)
    const { mockData } = await import("./mock-data")
    const openTickets = mockData.tickets.filter((t: any) => t.status === "Open").length
    const inProgress = mockData.tickets.filter((t: any) => t.status === "In Progress").length
    const resolved = mockData.tickets.filter((t: any) => t.status === "Resolved").length
    return {
      success: true,
      data: {
        total: mockData.tickets.length,
        open: openTickets,
        inProgress,
        resolved,
        avgResolutionTime: "3.2h",
      },
    }
  },
}

// Comments API
export const commentsAPI = {
  async getByTicket(ticketId: string): Promise<APIResponse<any[]>> {
    await delay(200)
    const { mockData } = await import("./mock-data")
    const comments = mockData.comments.filter((c: any) => c.ticketId === ticketId)
    return {
      success: true,
      data: comments,
    }
  },

  async create(ticketId: string, text: string): Promise<APIResponse<any>> {
    await delay(300)
    const newComment = {
      id: Date.now(),
      ticketId,
      author: "You",
      role: "Agent",
      text,
      timestamp: new Date(),
      attachments: [],
    }
    return {
      success: true,
      data: newComment,
    }
  },
}

// Activities API
export const activitiesAPI = {
  async getByTicket(ticketId: string): Promise<APIResponse<any[]>> {
    await delay(200)
    const { mockData } = await import("./mock-data")
    const activities = mockData.activities.filter((a: any) => a.ticketId === ticketId)
    return {
      success: true,
      data: activities,
    }
  },

  async getAll(limit = 50): Promise<APIResponse<any[]>> {
    await delay(300)
    const { mockData } = await import("./mock-data")
    return {
      success: true,
      data: mockData.activities.slice(0, limit),
    }
  },
}

// Files API
export const filesAPI = {
  async getByTicket(ticketId: string): Promise<APIResponse<any[]>> {
    await delay(200)
    const { mockData } = await import("./mock-data")
    const files = mockData.uploadedFiles.filter((f: any) => f.ticketId === ticketId)
    return {
      success: true,
      data: files,
    }
  },

  async upload(ticketId: string, file: File): Promise<APIResponse<any>> {
    await delay(500)
    const newFile = {
      id: Date.now(),
      ticketId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy: "You",
      uploadedAt: new Date(),
    }
    return {
      success: true,
      data: newFile,
    }
  },
}
