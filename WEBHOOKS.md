# Webhook Integration Guide

Ye helpdesk system multiple channels se automatically tickets create karta hai aur agents ko assign karta hai.

## Supported Channels

1. **WhatsApp** - WhatsApp Business messages
2. **Telegram** - Telegram bot messages
3. **Phone** - Voice calls (with transcription)
4. **Contact Form** - Website contact forms
5. **Website Chatbot** - Live chat widgets (Intercom, Drift, Tawk.to, etc.)
6. **Email** - Email-to-ticket conversion

## How It Works

1. External channel se message/call aata hai
2. System tenant detect karta hai (phone number/email/channel ke basis pe)
3. Ticket automatically create hota hai
4. Available agent ko automatically assign hota hai (load balancing ke saath)
5. Ticket tenant ke dashboard pe show hota hai

## Webhook Endpoints

### 1. Universal Ticket Webhook
**Endpoint:** `POST /api/webhooks/ticket`

**Use Case:** Generic endpoint jo sab channels ke liye kaam kare

**Request Body:**
```json
{
  "channel": "whatsapp", // whatsapp, telegram, phone, contact-form, chatbot, email
  "tenantId": 1, // Optional if channel detection works
  "phoneNumber": "+919876543210",
  "message": "Mera order track nahi ho raha",
  "customerName": "Rahul Kumar",
  "customerPhone": "+919876543210",
  "customerEmail": "rahul@example.com",
  "priority": "High", // Critical, High, Medium, Low
  "category": "technical" // general, technical, billing, feature, bug
}
```

### 2. WhatsApp Webhook
**Endpoint:** `POST /api/webhooks/whatsapp`

**Request Body:**
```json
{
  "from": "+919876543210",
  "message": "Help needed",
  "contactName": "Rahul",
  "whatsappNumber": "+919876543210"
}
```

**Tenant Detection:** WhatsApp business number se tenant detect hota hai

### 3. Telegram Webhook
**Endpoint:** `POST /api/webhooks/telegram`

**Request Body:**
```json
{
  "message": {
    "chat": {
      "id": 123456,
      "username": "rahul_kumar"
    },
    "text": "Help needed",
    "from": {
      "first_name": "Rahul",
      "last_name": "Kumar"
    }
  },
  "bot_username": "@acmecorp_support"
}
```

**Tenant Detection:** Telegram bot username se tenant detect hota hai

### 4. Phone Webhook
**Endpoint:** `POST /api/webhooks/phone`

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "calledNumber": "+919876543211",
  "transcript": "Customer called about order status",
  "recording": "https://example.com/recording.mp3",
  "duration": 120,
  "callerName": "Rahul Kumar"
}
```

### 5. Contact Form Webhook
**Endpoint:** `POST /api/webhooks/contact-form?tenantId=1`

**Request Body:**
```json
{
  "name": "Rahul Kumar",
  "email": "rahul@example.com",
  "phone": "+919876543210",
  "subject": "Order Issue",
  "message": "Mera order track nahi ho raha",
  "priority": "High"
}
```

**Note:** `tenantId` query parameter ya body mein required hai

### 6. Chatbot Webhook
**Endpoint:** `POST /api/webhooks/chatbot?tenantId=1`

**Request Body:**
```json
{
  "message": "Help needed with my order",
  "user": {
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "phone": "+919876543210"
  },
  "priority": "Medium"
}
```

## Tenant Configuration

Har tenant ko apne channels configure karne padenge:

```json
{
  "id": 1,
  "name": "Acme Corp",
  "channels": {
    "whatsapp": "+919876543210",
    "telegram": "@acmecorp_support",
    "phone": "+919876543211",
    "email": "support@acmecorp.com"
  }
}
```

## Auto Agent Assignment

System automatically:
1. Tenant ke available (online/away) agents ko dekhta hai
2. Load balancing karke sabse kam tickets wale agent ko assign karta hai
3. Agar koi online agent nahi hai, to kisi bhi agent ko assign kar deta hai

## Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "TKT-1234",
    "title": "Help needed",
    "status": "Open",
    "agent": "Alice Johnson",
    "tenantId": 1
  },
  "message": "Ticket created successfully and assigned to Alice Johnson"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Tenant not found"
}
```

## Integration Examples

### WhatsApp Business API (Twilio/360dialog)
```javascript
// In your WhatsApp webhook handler
fetch('https://your-domain.com/api/webhooks/whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: message.from,
    message: message.body,
    contactName: message.profileName,
    whatsappNumber: message.to
  })
})
```

### Contact Form (Website)
```html
<form action="https://your-domain.com/api/webhooks/contact-form?tenantId=1" method="POST">
  <input name="name" type="text">
  <input name="email" type="email">
  <textarea name="message"></textarea>
  <button type="submit">Submit</button>
</form>
```

### Telegram Bot
```javascript
// In Telegram bot webhook
bot.on('message', async (msg) => {
  await fetch('https://your-domain.com/api/webhooks/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: msg,
      bot_username: '@your_bot_username'
    })
  })
})
```

## Testing

### Test with cURL:

```bash
# WhatsApp
curl -X POST https://your-domain.com/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+919876543210",
    "message": "Test message",
    "contactName": "Test User",
    "whatsappNumber": "+919876543210"
  }'

# Contact Form
curl -X POST "https://your-domain.com/api/webhooks/contact-form?tenantId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

## Priority Detection

System automatically priority detect karta hai message content se:
- **Critical**: urgent, emergency, critical, asap, immediately
- **High**: important, problem, issue, not working, error
- **Medium**: Default

## Notes

- Har ticket automatically tenant ke dashboard pe show hoga
- Agent ko ticket assign hote hi notification milega (future implementation)
- Tickets real-time update hote hain
- Multiple channels se ek hi tenant ke tickets properly isolated hain

