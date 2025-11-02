// Forward requests to backend API
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let endpoint = ""
    if (type === "tenant-stats") {
      endpoint = "/analytics/tenant-stats"
    } else if (type === "ticket-stats") {
      endpoint = "/analytics/ticket-stats"
    } else {
      return Response.json({ success: false, error: "Invalid analytics type" })
    }

    const url = new URL(`${BACKEND_URL}${endpoint}`)
    searchParams.forEach((value, key) => {
      if (key !== "type") {
        url.searchParams.append(key, value)
      }
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
    console.error("Error forwarding analytics GET:", error)
    return Response.json(
      { success: false, error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
