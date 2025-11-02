import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"
import { detectTenantFromChannel } from "@/lib/api-client"

/**
 * Universal webhook endpoint for ticket creation from multiple channels
 * Supports: WhatsApp, Telegram, Phone, Contact Form, Website Chatbot, Email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Extract channel info
    const {
      channel, // whatsapp, telegram, phone, contact-form, chatbot, email
      tenantId, // Explicit tenant ID (optional if channel detection works)
      source, // Same as channel, for backward compatibility
      phoneNumber,
      telegramId,
      email,
      message,
      subject,
      customerName,
      customerEmail,
      customerPhone,
      priority = "Medium",
      category = "general",
      metadata = {},
    } = body
    
    const finalChannel = channel || source || "web"
    
    // Detect tenant if not provided
    let finalTenantId = tenantId
    if (!finalTenantId) {
      if (phoneNumber) {
        finalTenantId = await detectTenantFromChannel("phone", phoneNumber) ||
                        await detectTenantFromChannel("whatsapp", phoneNumber)
      } else if (telegramId) {
        finalTenantId = await detectTenantFromChannel("telegram", telegramId)
      } else if (email || customerEmail) {
        finalTenantId = await detectTenantFromChannel("email", email || customerEmail)
      }
    }
    
    if (!finalTenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant not found. Please provide tenantId or use a registered channel." },
        { status: 400 }
      )
    }
    
    // Create ticket
    const ticketData = {
      tenantId: finalTenantId,
      title: subject || message?.substring(0, 100) || "New Ticket from " + finalChannel,
      description: message || subject || "No description provided",
      priority: priority,
      category: category,
      customer: customerName || customerEmail || phoneNumber || telegramId || "Anonymous",
      source: finalChannel,
      channel: finalChannel,
      customerEmail: customerEmail,
      customerPhone: customerPhone || phoneNumber,
      metadata: {
        ...metadata,
        originalChannel: finalChannel,
        receivedAt: new Date().toISOString(),
      },
    }
    
    const result = await ticketAPI.create(ticketData)
    
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: result.data,
          message: `Ticket created successfully and assigned to ${result.data?.agent || "agent"}`,
        },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to create ticket" },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification (some services require this)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "Ticket Webhook Endpoint",
    supportedChannels: ["whatsapp", "telegram", "phone", "contact-form", "chatbot", "email"],
    usage: "POST to this endpoint with ticket data",
  })
}

