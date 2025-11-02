import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"
import { detectTenantFromChannel } from "@/lib/api-client"

/**
 * Phone/Voice Call Webhook Endpoint
 * Receives call data from phone systems, IVR, or voice-to-text services
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      phoneNumber, // Incoming caller number
      calledNumber, // The number that was called (business number)
      recording, // Voice recording URL
      transcript, // Transcribed text from call
      duration,
      timestamp,
      callerName,
      priority = "Medium",
      category = "general",
      tenantId, // Explicit tenant ID if not auto-detectable
    } = body
    
    if (!phoneNumber && !calledNumber) {
      return NextResponse.json(
        { success: false, error: "Phone number or called number is required" },
        { status: 400 }
      )
    }
    
    // Detect tenant from called number (business phone number)
    let finalTenantId = tenantId
    if (!finalTenantId && calledNumber) {
      finalTenantId = await detectTenantFromChannel("phone", calledNumber)
    }
    
    if (!finalTenantId) {
      return NextResponse.json(
        { success: false, error: "Tenant not found. Please configure phone number in tenant settings." },
        { status: 400 }
      )
    }
    
    // Use transcript if available, otherwise use a default message
    const description = transcript || 
                       recording ? "Voice call received. Recording available." : 
                       `Phone call received from ${phoneNumber}`
    
    // Create ticket
    const ticketData = {
      tenantId: finalTenantId,
      title: `Phone Call from ${callerName || phoneNumber || "Unknown"}`,
      description: description,
      priority,
      category,
      customer: callerName || phoneNumber || "Phone User",
      customerPhone: phoneNumber,
      source: "phone",
      channel: "phone",
      metadata: {
        phoneNumber,
        calledNumber,
        duration: duration || 0,
        recording: recording || null,
        transcript: transcript || null,
        timestamp: timestamp || new Date().toISOString(),
      },
    }
    
    const result = await ticketAPI.create(ticketData)
    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `Phone call ticket created and assigned to ${result.data?.agent || "agent"}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Phone webhook error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

