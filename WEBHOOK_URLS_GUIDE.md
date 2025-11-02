# 🔗 Webhook URLs Guide - Tenant ko URLs Kaise Milenge

## 📍 URLs Kahan Milenge?

### 1. **Tenant Admin ko Milega** ✅
**Location:** `/dashboard/tenant-admin/settings`

Tenant admin apne dashboard ke Settings page mein:
- ✅ Apna unique webhook token dekhega
- ✅ Har channel ke liye webhook URLs dekhega
- ✅ Copy button se URL copy kar sakta hai
- ✅ Regenerate token option hai

### 2. **Super Admin ko Milega** ✅
**Location:** `/dashboard/super-admin/tenants`

Super admin tenant management page pe:
- ✅ Har tenant ka webhook token dekhega
- ✅ Development team ko share kar sakta hai
- ✅ Token overview available hai

## 🎯 Webhook URL Format

Har tenant ka unique webhook URL format:

```
Base URL: https://your-domain.com/api/webhooks/tenant/{WEBHOOK_TOKEN}/{CHANNEL}
```

### Examples:

**Acme Corp (tenantId: 1)**
```
Universal: https://your-domain.com/api/webhooks/tenant/wh_acme_abc123xyz789
WhatsApp:  https://your-domain.com/api/webhooks/tenant/wh_acme_abc123xyz789/whatsapp
Telegram:  https://your-domain.com/api/webhooks/tenant/wh_acme_abc123xyz789/telegram
Phone:     https://your-domain.com/api/webhooks/tenant/wh_acme_abc123xyz789/phone
Contact:   https://your-domain.com/api/webhooks/tenant/wh_acme_abc123xyz789/contact-form
Chatbot:   https://your-domain.com/api/webhooks/tenant/wh_acme_abc123xyz789/chatbot
```

**Tech Startup (tenantId: 2)**
```
Universal: https://your-domain.com/api/webhooks/tenant/wh_tech_def456uvw012
WhatsApp:  https://your-domain.com/api/webhooks/tenant/wh_tech_def456uvw012/whatsapp
```

## 🔐 Webhook Token

- **Har tenant ka unique token hota hai**
- **Token tenant create hote hi auto-generate hota hai**
- **Token tenant admin ko Settings page pe dikhta hai**
- **Token regenerate kar sakte hain security ke liye**

## 📋 Complete Flow

### Step 1: Tenant Signup
```
New Company Signs Up
    ↓
Tenant Created
    ↓
Webhook Token Auto-Generated: wh_tenant_1234567890_abc123
    ↓
Tenant Admin Dashboard Access
```

### Step 2: Tenant Admin Gets URLs
```
Tenant Admin Login
    ↓
Go to Settings: /dashboard/tenant-admin/settings
    ↓
See "Webhook URLs" Section
    ↓
Copy URLs for each channel
```

### Step 3: Configure External Services
```
Tenant Admin:
1. Copy WhatsApp webhook URL
2. Go to Twilio/Meta WhatsApp settings
3. Paste URL in webhook configuration
4. Save

Same for Telegram, Phone, etc.
```

## 🛠️ For Development Team

### Super Admin Access:
1. **Login as Super Admin:** `admin@helpdesk.com` / `demo123`
2. **Go to:** `/dashboard/super-admin/tenants`
3. **View all tenants** with their webhook tokens
4. **Share URLs** with tenants as needed

### API Endpoint to Get Tenant Webhook Info:
```bash
GET /api/tenants
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Acme Corp",
      "webhookToken": "wh_acme_abc123xyz789",
      ...
    }
  ]
}
```

## 💡 Practical Examples

### Example 1: Tenant ko WhatsApp Setup Karna Hai

**Tenant Admin:**
1. Login karein: `/dashboard/tenant-admin`
2. Settings page pe jao: `/dashboard/tenant-admin/settings`
3. Webhook URLs section mein WhatsApp URL copy karein
4. Twilio console mein jao
5. WhatsApp Sandbox settings mein webhook URL paste karein
6. Save karein

**Webhook URL:**
```
https://your-domain.com/api/webhooks/tenant/wh_acme_abc123xyz789/whatsapp
```

### Example 2: Development Team Setup

**Super Admin / Dev Team:**
1. Login as super admin
2. Tenants page pe jao
3. Tenant ka webhook token dekhein
4. Tenant ko email/documentation mein share karein
5. Setup instructions provide karein

## 🔄 Token Regeneration

Agar security concern hai ya token leak ho gaya:

1. Tenant Admin: Settings page pe jao
2. "Regenerate Token" button click karein
3. Naya token generate hoga
4. Purane token invalid ho jayega
5. External services mein naya URL update karna hoga

## 📱 Real-World Scenario

**Scenario:** Acme Corp ko WhatsApp integration chahiye

1. **Acme Corp admin login karta hai**
2. **Settings page pe jata hai**
3. **WhatsApp webhook URL copy karta hai:**
   ```
   https://helpdesk.com/api/webhooks/tenant/wh_acme_abc123xyz789/whatsapp
   ```
4. **Twilio account mein jata hai**
5. **Webhook URL set karta hai**
6. **Test message bhejta hai**
7. **Ticket automatically create hota hai**
8. **Dashboard pe ticket dikhta hai**

## ✅ Benefits

1. **Security:** Har tenant ka unique token - tenant isolation
2. **Easy Setup:** Tenant admin khud setup kar sakta hai
3. **No Confusion:** Har tenant ko clearly apna URL milta hai
4. **Regeneration:** Token regenerate kar sakte hain
5. **Documentation:** Settings page pe instructions available

## 🎓 Summary

- ✅ **Tenant Admin** ko Settings page pe URLs milte hain
- ✅ **Super Admin** ko Tenant management page pe tokens dikhte hain
- ✅ **Unique token** har tenant ke liye automatically generate hota hai
- ✅ **Copy-paste** easy hai
- ✅ **Token regenerate** kar sakte hain

## 📞 Support

Agar tenant ko URLs nahi mil rahe:
1. Check Settings page: `/dashboard/tenant-admin/settings`
2. Verify tenant account active hai
3. Check browser console for errors
4. Contact super admin for help

