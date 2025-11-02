import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"
import { detectTenantFromChannel } from "@/lib/api-client"

/**
 * Telegram Webhook Endpoint
 * Receives messages from Telegram Bot API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Telegram webhook format
    const {
      message,
      callback_query, // For button interactions
      channel_post, // For channel posts
    } = body
    
    // Handle regular messages
    const msg = message || callback_query?.message
    if (!msg) {
      return NextResponse.json({ success: false, error: "No message data" }, { status: 400 })
    }
    
    const {
      chat,
      text,
      caption,
      from,
    } = msg
    
    const telegramId = chat?.username || chat?.id?.toString()
    const telegramBot = body.bot_username || body.username // The bot that received the message
    const messageText = text || caption || ""
    const customerName = from?.first_name + (from?.last_name ? " " + from.last_name : "") || 
                        chat?.title || 
                        chat?.first_name || 
                        "Telegram User"
    
    if (!telegramId || !messageText) {
      return NextResponse.json(
        { success: false, error: "Telegram ID and message are required" },
        { status: 400 }
      )
    }
    
    // Detect tenant from bot username or chat ID
    let tenantId = null
    if (telegramBot) {
      tenantId = await detectTenantFromChannel("telegram", "@" + telegramBot.replace("@", ""))
    }
    
    // If not found, try to get from metadata or use explicit tenantId
    if (!tenantId && body.tenantId) {
      tenantId = body.tenantId
    }
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant not found. Please configure Telegram bot username in tenant settings." },
        { status: 400 }
      )
    }
    
    // Create ticket
    const ticketData = {
      tenantId,
      title: `Telegram Message from ${customerName}`,
      description: messageText,
      priority: detectPriority(messageText),
      category: "general",
      customer: customerName,
      source: "telegram",
      channel: "telegram",
      metadata: {
        telegramId: telegramId,
        telegramChatId: chat?.id,
        telegramUsername: chat?.username,
        timestamp: new Date(msg.date * 1000).toISOString(),
      },
    }
    
    const result = await ticketAPI.create(ticketData)
    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `Telegram ticket created and assigned to ${result.data?.agent || "agent"}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Telegram webhook error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

function detectPriority(message: string): string {
  const urgentKeywords = ["urgent", "emergency", "critical", "asap"]
  const highKeywords = ["important", "problem", "issue", "not working"]
  
  const lowerMessage = message.toLowerCase()
  
  if (urgentKeywords.some((kw) => lowerMessage.includes(kw))) {
    return "Critical"
  }
  if (highKeywords.some((kw) => lowerMessage.includes(kw))) {
    return "High"
  }
  
  return "Medium"
}

