export type TicketKind = "service-request" | "troubleshooting"

const normalize = (value: unknown): string => (typeof value === "string" ? value.trim().toLowerCase() : "")

const SERVICE_REQUEST_SET = new Set(["service-request", "service_request"])
const TROUBLESHOOTING_SET = new Set(["troubleshooting", "troubleshoot"])

const getTicketKindValues = (ticket: any) => {
  const metadata = ticket?.metadata ?? {}
  return {
    metadataKind: normalize(metadata.kind),
    metadataCallType: normalize(metadata.callType),
    metadataIntent: normalize(metadata.intent),
  }
}

export const isStrictKindTicket = (ticket: any, target: TicketKind): boolean => {
  const values = getTicketKindValues(ticket)
  const validValues = target === "service-request" ? SERVICE_REQUEST_SET : TROUBLESHOOTING_SET
  return (
    validValues.has(values.metadataKind) ||
    validValues.has(values.metadataCallType) ||
    validValues.has(values.metadataIntent)
  )
}

export const matchesTicketKind = (ticket: any, target: TicketKind): boolean => {
  return isStrictKindTicket(ticket, target)
}
