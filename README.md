# SMS Pay — SMS Payment Verification

Parse bank SMS → Telegram notification. **Zero dependencies, zero cost.**

## How it works

```
Android phone → SMSForwarder → POST /api/sms → Regex parse → Telegram
```

- **No database** — just parses and notifies
- **No AI** — regex only, free, instant
- **No Supabase** — runs anywhere

## Setup (5 minutes)

### 1. Install

```bash
cd apps/sms-pay
pnpm install
pnpm dev
```

Server runs on `http://localhost:3456`

### 2. Android

Install [SMSForwarder](https://github.com/SunilDhaker/SMSForwarder):
- Rule: sender contains `KhanBank`
- Target: `POST http://YOUR_IP:3456/api/sms`
- Body: `{"sender":"${sender}","message":"${text}","received_at":"${time}"}`

### 3. Telegram (optional)

Add to `.env.local`:
```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 4. Test

```bash
curl -X POST http://localhost:3456/api/sms \
  -H "Content-Type: application/json" \
  -d '{"sender":"KhanBank","message":"Таны дансанд 100,000₮ орлого орлоо. Илгээгч: БАТ-ЭРДЭНЭ. Утга: ИНВОЙС-1234"}'
```

## Host on your iMac

```bash
# Run in background
cd apps/sms-pay && nohup pnpm dev > /tmp/sms-pay.log 2>&1 &

# Or as a launchd service (survives reboot)
# See: ~/Library/LaunchAgents/
```

Your iMac's local IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`

## Adding a bank

Edit `src/app/api/sms/route.ts` → `BANK_PATTERNS`:

```typescript
{
    bank: "newbank",
    senders: ["newbank", "нийт банк"],
    amount: /(\d[\d,\.]+)\s*₮/,
    senderName: /илгээгч:\s*([^\s.,]+)/i,
    reference: /утга:\s*([^\s.,]+)/i,
    outgoing: /гарлага|шилжүүлсэн/,
},
```

## API

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/sms` | Receive SMS, parse, notify |
| `GET` | `/api/sms` | Health check + list supported banks |
