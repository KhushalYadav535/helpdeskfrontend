import { NextRequest, NextResponse } from "next/server"
import { ticketAPI } from "@/lib/api-client"

/**
 * Contact Form Webhook Endpoint
 * Receives submissions from website contact forms
 * tenantId should be passed as query parameter or in form data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    
    // Get tenantId from query param or body
    const tenantId = Number.parseInt(searchParams.get("tenantId") || body.tenantId)
    
    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: "tenantId is required (as query param or in body)" },
        { status: 400 }
      )
    }
    
    const {
      name,
      email,
      phone,
      subject,
      message,
      priority = "Medium",
      category = "general",
    } = body
    
    if (!message && !subject) {
      return NextResponse.json(
        { success: false, error: "Message or subject is required" },
        { status: 400 }
      )
    }
    
    // Create ticket
    const ticketData = {
      tenantId,
      title: subject || `Contact Form Submission from ${name || email || "Anonymous"}`,
      description: message || subject,
      priority,
      category,
      customer: name || email || "Anonymous",
      customerEmail: email,
      customerPhone: phone,
      source: "contact-form",
      channel: "contact-form",
      metadata: {
        submittedAt: new Date().toISOString(),
        referrer: body.referrer || request.headers.get("referer"),
        userAgent: request.headers.get("user-agent"),
      },
    }
    
    const result = await ticketAPI.create(ticketData)
    
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: `Contact form ticket created and assigned to ${result.data?.agent || "agent"}`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Contact form webhook error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

