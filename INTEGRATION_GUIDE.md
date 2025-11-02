# Multi-Channel Integration Guide (Hindi/English)

Ye guide explain karega ki aap kaise WhatsApp, Telegram, Phone, Contact Form, aur Chatbot se tickets automatically create kar sakte ho.

## 🎯 Overview - Kaise Kaam Karta Hai

```
Customer Message → Channel (WhatsApp/Telegram/etc.) → Webhook URL → Our System → Auto Create Ticket → Auto Assign Agent → Dashboard pe Show
```

## 📋 Step-by-Step Setup

### Step 1: Tenant Configuration
Pehle aapko tenant ke channels configure karne padenge:

**Example:**
- Acme Corp company ka WhatsApp number: `+919876543210`
- Acme Corp ka Telegram bot: `@acmecorp_support`
- Acme Corp ka Phone number: `+919876543211`

Ye details already `lib/mock-data.ts` mein configure hain.

### Step 2: Webhook URL Setup
Aapke webhook URLs:
- Universal: `https://your-domain.com/api/webhooks/ticket`
- WhatsApp: `https://your-domain.com/api/webhooks/whatsapp`
- Telegram: `https://your-domain.com/api/webhooks/telegram`
- Phone: `https://your-domain.com/api/webhooks/phone`
- Contact Form: `https://your-domain.com/api/webhooks/contact-form`
- Chatbot: `https://your-domain.com/api/webhooks/chatbot`

## 🔧 Integration Examples

### 1. WhatsApp Integration

#### Option A: WhatsApp Business API (Twilio/360dialog)

**Twilio WhatsApp Setup:**
```javascript
// Twilio webhook handler (Node.js/Express)
const express = require('express');
const app = express();
app.use(express.json());

app.post('/twilio-webhook', async (req, res) => {
  const { From, To, Body } = req.body;
  
  // Forward to our webhook
  const response = await fetch('https://your-domain.com/api/webhooks/whatsapp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: From,                    // Customer number
      message: Body,                  // Message text
      contactName: req.body.ProfileName || 'WhatsApp User',
      whatsappNumber: To              // Business WhatsApp number
    })
  });
  
  const result = await response.json();
  console.log('Ticket created:', result);
  
  // Return success to Twilio
  res.send('<Response><Message>Thank you! We have received your message.</Message></Response>');
});

app.listen(3000);
```

**Twilio Configuration:**
1. Twilio Console mein jao
2. WhatsApp Sandbox setup karo
3. Webhook URL set karo: `https://your-server.com/twilio-webhook`
4. Jab message aaye, woh automatically aapke system ko forward hoga

#### Option B: WhatsApp Business Cloud API

```javascript
// Meta WhatsApp Business API webhook
app.post('/meta-webhook', async (req, res) => {
  const entry = req.body.entry[0];
  const changes = entry.changes[0];
  const value = changes.value;
  
  if (value.messages) {
    const message = value.messages[0];
    
    await fetch('https://your-domain.com/api/webhooks/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: message.from,
        message: message.text?.body || '',
        contactName: value.contacts?.[0]?.profile?.name || 'User',
        whatsappNumber: value.metadata?.phone_number_id
      })
    });
  }
  
  res.sendStatus(200);
});
```

### 2. Telegram Bot Integration

**Telegram Bot Setup:**
1. Telegram BotFather se bot banao: `/newbot`
2. Bot token lo
3. Webhook set karo ya polling use karo

**Polling Method (Recommended):**
```javascript
const TelegramBot = require('node-telegram-bot-api');
const token = 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Forward to our webhook
  const response = await fetch('https://your-domain.com/api/webhooks/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: msg,
      bot_username: '@your_bot_username' // Your bot username
    })
  });
  
  const result = await response.json();
  
  // Reply to user
  if (result.success) {
    bot.sendMessage(chatId, `✅ Ticket created! Ticket ID: ${result.data.id}\nOur agent will respond shortly.`);
  } else {
    bot.sendMessage(chatId, '❌ Sorry, there was an error. Please try again.');
  }
});
```

**Webhook Method:**
```javascript
// Set webhook in Telegram
app.post('/telegram-webhook', async (req, res) => {
  const { message } = req.body;
  
  if (message) {
    await fetch('https://your-domain.com/api/webhooks/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        bot_username: '@your_bot_username'
      })
    });
  }
  
  res.sendStatus(200);
});
```

### 3. Contact Form Integration

**Simple HTML Form:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Contact Us</title>
</head>
<body>
    <form id="contactForm">
        <input type="text" name="name" placeholder="Your Name" required>
        <input type="email" name="email" placeholder="Your Email" required>
        <input type="tel" name="phone" placeholder="Your Phone">
        <input type="text" name="subject" placeholder="Subject" required>
        <textarea name="message" placeholder="Your Message" required></textarea>
        <button type="submit">Submit</button>
    </form>

    <script>
        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            
            // tenantId - aapko apni website ke according set karna hoga
            const tenantId = 1; // Acme Corp
            
            const response = await fetch(`https://your-domain.com/api/webhooks/contact-form?tenantId=${tenantId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Thank you! Ticket created: ' + result.data.id);
                e.target.reset();
            } else {
                alert('Error: ' + result.error);
            }
        });
    </script>
</body>
</html>
```

**WordPress/PHP Integration:**
```php
<?php
// contact-form-handler.php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = [
        'name' => $_POST['name'],
        'email' => $_POST['email'],
        'phone' => $_POST['phone'],
        'subject' => $_POST['subject'],
        'message' => $_POST['message'],
        'tenantId' => 1 // Your tenant ID
    ];
    
    $ch = curl_init('https://your-domain.com/api/webhooks/contact-form?tenantId=1');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($result['success']) {
        echo json_encode(['success' => true, 'ticketId' => $result['data']['id']]);
    } else {
        echo json_encode(['success' => false, 'error' => $result['error']]);
    }
}
?>
```

### 4. Website Chatbot Integration

#### Intercom Integration:
```javascript
// Intercom custom app
Intercom('onUnreadCountChange', function(unreadCount) {
  // When user sends message
  Intercom('onHide', function() {
    // Get conversation data
    fetch('https://your-domain.com/api/webhooks/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 1,
        message: conversation.last_message.body,
        user: {
          name: conversation.user.name,
          email: conversation.user.email
        },
        provider: 'intercom'
      })
    });
  });
});
```

#### Tawk.to Integration:
```javascript
// Tawk.to callback
Tawk_API.onChatStarted = function() {
  Tawk_API.onChatMessageReceived = function(message) {
    fetch('https://your-domain.com/api/webhooks/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 1,
        message: message,
        user: {
          name: Tawk_API.getVisitorName(),
          email: Tawk_API.getVisitorEmail()
        },
        provider: 'tawkto'
      })
    });
  };
};
```

### 5. Phone/Voice Call Integration

**Twilio Voice Call:**
```javascript
// Twilio voice webhook
app.post('/voice-webhook', async (req, res) => {
  const { Caller, Called, CallSid } = req.body;
  
  // Get call recording/transcript if available
  const recording = await getCallRecording(CallSid);
  const transcript = await getTranscript(CallSid);
  
  await fetch('https://your-domain.com/api/webhooks/phone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: Caller,
      calledNumber: Called,
      transcript: transcript,
      recording: recording,
      callerName: req.body.CallerName || 'Unknown',
      duration: req.body.CallDuration
    })
  });
  
  // Return TwiML response
  res.type('text/xml');
  res.send(`
    <Response>
      <Say>Thank you for calling. Your call has been logged as a ticket.</Say>
      <Record maxLength="60" />
    </Response>
  `);
});
```

## 🧪 Testing

### Local Testing with ngrok:
```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js app
npm run dev

# In another terminal, expose local port
ngrok http 3000

# Use ngrok URL for webhooks:
# https://abc123.ngrok.io/api/webhooks/whatsapp
```

### Test with cURL:
```bash
# WhatsApp test
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+919876543210",
    "message": "Test message from WhatsApp",
    "contactName": "Test User",
    "whatsappNumber": "+919876543210"
  }'

# Telegram test
curl -X POST http://localhost:3000/api/webhooks/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "chat": {
        "id": 123456,
        "username": "test_user"
      },
      "text": "Test message",
      "from": {
        "first_name": "Test",
        "last_name": "User"
      }
    },
    "bot_username": "@acmecorp_support"
  }'

# Contact form test
curl -X POST "http://localhost:3000/api/webhooks/contact-form?tenantId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rahul Kumar",
    "email": "rahul@example.com",
    "phone": "+919876543210",
    "subject": "Test Subject",
    "message": "Test message"
  }'
```

## 📱 Complete Flow Example

**Scenario:** Customer WhatsApp se message karta hai

1. **Customer WhatsApp par message bhejta hai:**
   ```
   Customer: "Mera order track nahi ho raha"
   ```

2. **WhatsApp Business API webhook trigger hota hai:**
   ```javascript
   // Twilio/Meta receives message and calls your webhook
   POST /your-server/twilio-webhook
   {
     "From": "+919876543210",
     "To": "+919876543211",  // Your business WhatsApp
     "Body": "Mera order track nahi ho raha"
   }
   ```

3. **Aapka server aapke webhook ko forward karta hai:**
   ```javascript
   POST https://your-domain.com/api/webhooks/whatsapp
   {
     "from": "+919876543210",
     "message": "Mera order track nahi ho raha",
     "whatsappNumber": "+919876543211"
   }
   ```

4. **System automatically:**
   - Tenant detect karta hai: `+919876543211` se Acme Corp (tenantId: 1)
   - Ticket create karta hai: `TKT-1234`
   - Agent assign karta hai: Available agent ko (load balancing)
   - Response return karta hai

5. **Ticket dashboard pe show hota hai:**
   - Tenant admin dashboard pe dikhega
   - Assigned agent ke dashboard pe dikhega
   - Ticket details: WhatsApp se aaya, customer number, message, etc.

## 🔐 Security Tips

1. **Webhook Authentication:**
```javascript
// Add secret key validation
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!validateSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Process webhook...
});
```

2. **Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/webhooks', limiter);
```

## 📊 Monitoring

Tickets check karne ke liye:
- Dashboard: `https://your-domain.com/dashboard/tenant-admin/tickets`
- API: `GET /api/tickets?tenantId=1`

## 🚀 Production Deployment

1. **Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://your-domain.com
WEBHOOK_SECRET=your-secret-key
```

2. **Deploy Next.js app to Vercel/Railway/etc.**

3. **Update webhook URLs in external services:**
   - Twilio: `https://your-domain.com/api/webhooks/whatsapp`
   - Telegram: Set webhook URL
   - Contact forms: Update action URLs

## ❓ Common Issues

**Q: Tenant detect nahi ho raha?**
- Check tenant channels configuration in `mock-data.ts`
- Verify phone number format matches

**Q: Agent assign nahi ho raha?**
- Check if tenant has agents
- Verify agents have `tenantId` set

**Q: Tickets show nahi ho rahe?**
- Check tenantId filtering
- Verify ticket was created successfully
- Check dashboard filtering

## 📞 Support

Agar koi issue ho to check karein:
- Webhook logs
- Browser console
- Network tab mein requests

