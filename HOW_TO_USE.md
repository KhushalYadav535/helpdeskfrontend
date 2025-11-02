# 🎯 Kaise Use Kare - Complete Guide

## 📍 Tickets Kahan Dikhenge?

### 1. **Tenant Admin Dashboard**
- URL: `/dashboard/tenant-admin/tickets`
- Yahan aapko **sabhi tickets** dikhenge jo aapke tenant ke channels se aaye hain
- Auto-refresh: Har 30 seconds mein automatically update hota hai
- Source indicator: Har ticket pe source dikhega (WhatsApp, Telegram, Phone, etc.)

### 2. **Agent Dashboard**
- URL: `/dashboard/agent`
- Yahan agent ko sirf **unke assigned tickets** dikhenge

### 3. **Dashboard Homepage**
- URL: `/dashboard/tenant-admin`
- Top pe stats cards mein:
  - **Open Tickets** count
  - **Resolved** count
  - Notification bell pe open tickets ka count

## 🔔 Kaise Pata Chalega Ki Ticket Aaya?

### Method 1: Dashboard Stats (Automatic)
- Dashboard homepage pe **"Open Tickets"** card mein count dikhega
- Example: Agar 5 open tickets hain to **"5"** dikhega
- Har 30 seconds mein automatically update hota hai

### Method 2: Notification Bell (Top Right)
- Top navigation bar mein bell icon pe **red badge** dikhega
- Number = Open tickets count
- Example: Agar 3 open tickets hain to **"3"** badge dikhega

### Method 3: Tickets Page (Direct)
- **Tickets page** pe jao: `/dashboard/tenant-admin/tickets`
- Yahan sabhi tickets list mein dikhenge
- Newest tickets top pe hote hain
- Har ticket pe:
  - Source badge (WhatsApp, Telegram, etc.)
  - Customer phone number
  - Priority color
  - Status

### Method 4: Auto-Refresh Indicator
- Tickets page pe **"Last updated"** time dikhega
- Example: "Last updated: 2:30:45 PM"
- Refresh button se manually bhi refresh kar sakte ho

## 📱 Test Karne Ke Liye

### Step 1: Test Webhook Call
Terminal mein run karein:

```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+919876543210",
    "message": "Test message from WhatsApp",
    "contactName": "Test User",
    "whatsappNumber": "+919876543210"
  }'
```

### Step 2: Dashboard Check Karein
1. Browser mein jao: `http://localhost:3000/dashboard/tenant-admin`
2. **"Open Tickets"** card check karein - count increase hoga
3. **Tickets page** pe jao - naya ticket dikhega

### Step 3: Ticket Details Dekhne
- Ticket card click karein
- Dekhenge:
  - ✅ Ticket ID
  - ✅ Customer name & phone
  - ✅ Source (WhatsApp/Telegram/etc.)
  - ✅ Priority
  - ✅ Assigned agent

## 🔍 Real-World Example

**Scenario:** Customer WhatsApp se message bhejta hai

1. **Customer:** WhatsApp pe message bhejta hai
   ```
   "Hello, mera order track nahi ho raha"
   ```

2. **System automatically:**
   - Tenant detect: Phone number se
   - Ticket create: `TKT-1234`
   - Agent assign: Available agent ko

3. **Dashboard pe dikhega:**
   - ✅ Notification bell: Badge count increase
   - ✅ Open Tickets card: Count +1
   - ✅ Tickets page: New ticket list mein
   - ✅ Source badge: "WhatsApp"
   - ✅ Customer phone: "+919876543210"

4. **Agent ko dikhega:**
   - ✅ Agent dashboard pe assigned ticket
   - ✅ Notification count increase

## 📊 Current Features

✅ **Real-time Updates**
- Auto-refresh har 30 seconds
- Manual refresh button
- Last updated timestamp

✅ **Source Indicators**
- WhatsApp icon & badge
- Telegram icon & badge
- Phone icon & badge
- Contact form badge

✅ **Smart Filtering**
- Tenant-specific tickets only
- Status-based filtering (Open/In Progress/Resolved)
- Priority-based filtering

✅ **Notifications**
- Bell icon pe open tickets count
- Dashboard stats cards
- Visual indicators

## 🚀 Production Setup

1. **Webhook URL Setup:**
   ```
   Production: https://your-domain.com/api/webhooks/whatsapp
   ```

2. **External Service Configuration:**
   - Twilio: Webhook URL set karo
   - Telegram Bot: Webhook URL set karo
   - Contact Form: Action URL update karo

3. **Monitor:**
   - Dashboard pe regular check karein
   - Tickets page pe new tickets verify karein
   - Notification bell pe counts verify karein

## 💡 Tips

1. **Always check Tickets page** for complete list
2. **Dashboard stats** for quick overview
3. **Notification bell** for new ticket alerts
4. **Refresh button** for manual updates
5. **Source badges** se pata chalega kaunse channel se aaya

## ❓ Troubleshooting

**Q: Tickets dikh nahi rahe?**
- Check tenantId is correct
- Verify webhook was called successfully
- Check browser console for errors
- Verify API response

**Q: Notification count wrong?**
- Refresh dashboard
- Check tickets page manually
- Verify ticket status (only "Open" tickets count)

**Q: New ticket dikh nahi raha?**
- Wait 30 seconds for auto-refresh
- Click refresh button manually
- Check if tenantId matches

