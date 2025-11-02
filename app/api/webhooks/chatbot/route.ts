import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"

/**
 * Website Chatbot Webhook Endpoint
 * Receives messages from website chatbot integrations (Intercom, Drift, Tawk.to, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    
    // Get tenantId from query param, body, or metadata
    const tenantId = Number.parseInt(
      searchParams.get("tenantId") || 
      body.tenantId || 
      body.metadata?.tenantId
    )
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required" },
        { status: 400 }
      )
    }
    
    const {
      message,
      text,
      user,
      visitor,
      customer,
      priority = "Medium",
      category = "general",
      metadata = {},
    } = body
    
    const messageText = message || text || body.body || ""
    const customerName = user?.name || 
                        visitor?.name || 
                        customer?.name || 
                        user?.email ||
                        visitor?.email ||
                        "Chatbot User"
    const customerEmail = user?.email || visitor?.email || customer?.email
    const customerPhone = user?.phone || visitor?.phone || customer?.phone
    
    if (!messageText) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 }
      )
    }
    
    // Create ticket
    const ticketData = {
      tenantId,
      title: `Chatbot Message from ${customerName}`,
      description: messageText,
      priority,
      category,
      customer: customerName,
      customerEmail,
      customerPhone,
      source: "chatbot",
      channel: "chatbot",
      metadata: {
        ...metadata,
        chatbotProvider: body.provider || metadata.provider,
        sessionId: body.sessionId || metadata.sessionId,
        timestamp: new Date().toISOString(),
      },
    }
    
    const result = await ticketAPI.create(ticketData)
    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `Chatbot ticket created and assigned to ${result.data?.agent || "agent"}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Chatbot webhook error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

