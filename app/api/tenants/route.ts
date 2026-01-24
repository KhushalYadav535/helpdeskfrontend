// Forward requests to backend API
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.credibilitycrm.com/api"

export async function GET(request: Request) {
  try {
    const response = await fetch(`${BACKEND_URL}/tenants`, {
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization")!,
        }),
      },
    })

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error: any) {
    console.error("Error forwarding tenants GET:", error)
    return Response.json(
      { success: false, error: error.message || "Failed to fetch tenants" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const response = await fetch(`${BACKEND_URL}/tenants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization")!,
        }),
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()
    return Response.json(result, { status: response.status })
  } catch (error: any) {
    console.error("Error forwarding tenants POST:", error)
    return Response.json(
      { success: false, error: error.message || "Failed to create tenant" },
      { status: 500 }
    )
  }
}
