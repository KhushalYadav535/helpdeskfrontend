import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"
import { detectTenantFromChannel } from "@/lib/api-client"

/**
 * WhatsApp Webhook Endpoint
 * Receives messages from WhatsApp Business API or WhatsApp integration services
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Common WhatsApp webhook formats (adapt based on your WhatsApp service provider)
    const {
      from, // Phone number (e.g., "+919876543210")
      message,
      text,
      body,
      media,
      contactName,
      timestamp,
      whatsappNumber, // The business WhatsApp number that received the message
    } = body
    
    const phoneNumber = from || body.phoneNumber || whatsappNumber
    const messageText = message?.text || text || body?.text || body || ""
    const customerName = contactName || body.name || body.contactName || "WhatsApp User"
    
    if (!phoneNumber || !messageText) {
      return NextResponse.json(
        { success: false, error: "Phone number and message are required" },
        { status: 400 }
      )
    }
    
    // Detect tenant from WhatsApp number (the business number that received it)
    const tenantId = await detectTenantFromChannel("whatsapp", phoneNumber)
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant not found for this WhatsApp number" },
        { status: 400 }
      )
    }
    
    // Create ticket
    const ticketData = {
      tenantId,
      title: `WhatsApp Message from ${customerName}`,
      description: messageText,
      priority: detectPriority(messageText),
      category: "general",
      customer: customerName,
      customerPhone: phoneNumber,
      source: "whatsapp",
      channel: "whatsapp",
      metadata: {
        whatsappFrom: phoneNumber,
        timestamp: timestamp || new Date().toISOString(),
        hasMedia: !!media,
        media: media,
      },
    }
    
    const result = await ticketAPI.create(ticketData)
    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `WhatsApp ticket created and assigned to ${result.data?.agent || "agent"}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("WhatsApp webhook error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// Simple priority detection from message content
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

