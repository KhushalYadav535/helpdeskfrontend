import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"
import { detectTenantFromToken } from "@/lib/api-client"

/**
 * Tenant-specific webhook endpoint
 * Format: /api/webhooks/tenant/[token]/[channel]
 * Example: /api/webhooks/tenant/wh_acme_abc123xyz789/whatsapp
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json()
    
    // Detect tenant from token
    const tenantId = await detectTenantFromToken(token)
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook token" },
        { status: 401 }
      )
    }
    
    // Extract channel from URL path or body
    const url = new URL(request.url)
    const pathParts = url.pathname.split("/")
    const channel = pathParts[pathParts.length - 1] || body.channel || "ticket"
    
    // Get data from body
    const {
      message,
      text,
      phoneNumber,
      email,
      customerName,
      customerEmail,
      customerPhone,
      subject,
      priority = "Medium",
      category = "general",
      metadata = {},
    } = body
    
    const messageText = message || text || body.body || subject || ""
    
    if (!messageText && !subject) {
      return NextResponse.json(
        { success: false, error: "Message or subject is required" },
        { status: 400 }
      )
    }
    
    // Create ticket
    const ticketData = {
      tenantId,
      title: subject || `New ${channel} message from ${customerName || customerEmail || phoneNumber || "Customer"}`,
      description: messageText,
      priority,
      category,
      customer: customerName || customerEmail || phoneNumber || "Unknown",
      customerEmail: customerEmail || email,
      customerPhone: customerPhone || phoneNumber,
      source: channel,
      channel: channel,
      metadata: {
        ...metadata,
        webhookToken: token,
        receivedAt: new Date().toISOString(),
      },
    }
    
    const result = await ticketAPI.create(ticketData)
    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `Ticket created successfully and assigned to ${result.data?.agent || "agent"}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Tenant webhook error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params
  const tenantId = await detectTenantFromToken(token)
  
  if (!tenantId) {
    return NextResponse.json(
      { success: false, error: "Invalid webhook token" },
      { status: 401 }
    )
  }
  
  return NextResponse.json({
    success: true,
    message: "Webhook endpoint is active",
    tenantId,
    supportedChannels: ["whatsapp", "telegram", "phone", "contact-form", "chatbot", "email", "ticket"],
    usage: `POST to this endpoint with channel in path or body: /api/webhooks/tenant/${token}/[channel]`,
  })
}

