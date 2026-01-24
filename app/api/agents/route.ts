// Forward requests to backend API
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.credibilitycrm.com/api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = new URL(`${BACKEND_URL}/agents`)
    
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
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
    console.error("Error forwarding agents GET:", error)
    return Response.json(
      { success: false, error: error.message || "Failed to fetch agents" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    const response = await fetch(`${BACKEND_URL}/agents`, {
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
    console.error("Error forwarding agents POST:", error)
    return Response.json(
      { success: false, error: error.message || "Failed to create agent" },
      { status: 500 }
    )
  }
}
