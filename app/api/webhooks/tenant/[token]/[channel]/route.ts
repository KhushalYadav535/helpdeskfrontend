import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"
import { detectTenantFromToken, detectTenantFromChannel } from "@/lib/api-client"

/**
 * Channel-specific tenant webhook
 * Format: /api/webhooks/tenant/[token]/[channel]
 * Example: /api/webhooks/tenant/wh_acme_abc123xyz789/whatsapp
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string; channel: string } }
) {
  try {
    const { token, channel } = params
    const body = await request.json()
    
    // Detect tenant from token (primary method)
    let tenantId = await detectTenantFromToken(token)
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Invalid webhook token" },
        { status: 401 }
      )
    }
    
    // Handle different channels
    let ticketData: any = {
      tenantId,
      source: channel,
      channel: channel,
      priority: "Medium",
      category: "general",
    }
    
    switch (channel.toLowerCase()) {
      case "whatsapp":
        const { from, message, contactName, whatsappNumber } = body
        ticketData = {
          ...ticketData,
          title: `WhatsApp Message from ${contactName || from || "Customer"}`,
          description: message || body.text || body.body || "",
          customer: contactName || from || "WhatsApp User",
          customerPhone: from || whatsappNumber,
          priority: detectPriority(message || body.text || ""),
          metadata: {
            whatsappFrom: from,
            timestamp: new Date().toISOString(),
          },
        }
        break
        
      case "telegram":
        const msg = body.message || body
        ticketData = {
          ...ticketData,
          title: `Telegram Message from ${msg.from?.first_name || msg.chat?.title || "Customer"}`,
          description: msg.text || msg.caption || "",
          customer: `${msg.from?.first_name || ""} ${msg.from?.last_name || ""}`.trim() || msg.chat?.title || "Telegram User",
          priority: detectPriority(msg.text || msg.caption || ""),
          metadata: {
            telegramId: msg.chat?.id || msg.chat?.username,
            timestamp: new Date().toISOString(),
          },
        }
        break
        
      case "phone":
        ticketData = {
          ...ticketData,
          title: `Phone Call from ${body.callerName || body.phoneNumber || "Unknown"}`,
          description: body.transcript || body.message || "Voice call received",
          customer: body.callerName || body.phoneNumber || "Phone User",
          customerPhone: body.phoneNumber,
          metadata: {
            recording: body.recording,
            duration: body.duration,
            timestamp: new Date().toISOString(),
          },
        }
        break
        
      case "contact-form":
      case "chatbot":
        ticketData = {
          ...ticketData,
          title: body.subject || `New ${channel} message from ${body.name || body.customerName || "Customer"}`,
          description: body.description || body.message || body.text || body.body || "",
          customer: body.name || body.customerName || body.email || "Customer",
          customerEmail: body.email || body.customerEmail,
          customerPhone: body.phone || body.customerPhone,
          priority: body.priority || "Medium",
          category: body.category || "general",
          metadata: {
            submittedAt: new Date().toISOString(),
          },
        }
        break
        
      default:
        // Generic ticket
        ticketData = {
          ...ticketData,
          title: body.subject || body.title || `New ${channel} message`,
          description: body.message || body.text || body.body || body.description || "",
          customer: body.customerName || body.name || body.email || body.phoneNumber || "Customer",
          customerEmail: body.email || body.customerEmail,
          customerPhone: body.phoneNumber || body.customerPhone,
          priority: body.priority || "Medium",
        }
    }
    
    if (!ticketData.description || ticketData.description.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 }
      )
    }
    
    const result = await ticketAPI.create(ticketData)
    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `Ticket created and assigned to ${result.data?.agent || "agent"}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error(`Webhook error (${params.channel}):`, error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

function detectPriority(message: string): string {
  const urgentKeywords = ["urgent", "emergency", "critical", "asap", "immediately"]
  const highKeywords = ["important", "problem", "issue", "not working", "error"]
  
  const lowerMessage = message.toLowerCase()
  
  if (urgentKeywords.some((kw) => lowerMessage.includes(kw))) {
    return "Critical"
  }
  if (highKeywords.some((kw) => lowerMessage.includes(kw))) {
    return "High"
  }
  
  return "Medium"
}

