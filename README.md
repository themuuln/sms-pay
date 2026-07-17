# SMS Pay

SMS-аар төлбөр баталгаажуулах систем. Банкны SMS-ийг хүлээн авч, regex-аар задлаж, Telegram-р мэдэгдэл илгээнэ.

## Ажиллах зарчим

```
Android утас (Khan Bank SIM)
    │
    ▼  SMSForwarder апп
POST /api/sms → { sender, message, received_at }
    │
    ▼  Regex задлалт (<14ms, үнэгүй)
{ bank: "khanbank", amount: 100000, sender_name: "БАТ-ЭРДЭНЭ", reference: "ИНВОЙС-1234" }
    │
    ▼  Telegram мэдэгдэл
💰 Төлбөр ирлээ
Банк: khanbank
Дүн: 100,000₮
Илгээгч: БАТ-ЭРДЭНЭ
Утга: ИНВОЙС-1234
```

## Онцлог

- **Үнэгүй** — regex задлалт, API төлбөргүй
- **Хурдан** — <14ms нэг SMS задлах
- **Хялбар** — 1 файл, 3 нэмэлт (next, react, react-dom)
- **Мөрдөхгүй** — Supabase, AI, нэмэлт үйлчилгээ шаардлагагүй

## Суулгах

### 1. Завсрын нөхцөл

```bash
git clone git@github.com:themuuln/sms-pay.git
cd sms-pay
pnpm install
```

### 2. .env файл

```bash
cp .env.example .env.local
```

Зөвхөн Telegram мэдэгдэл хүсвэл:
```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

### 3. Эхлүүлэх

```bash
pnpm dev
```

`http://localhost:3456` дээр ажиллана.

### 4. Тест

```bash
curl -X POST http://localhost:3456/api/sms \
  -H "Content-Type: application/json" \
  -d '{"sender":"KhanBank","message":"Таны дансанд 100,000₮ орлого орлоо. Илгээгч: БАТ-ЭРДЭНЭ. Утга: ИНВОЙС-1234. Үлдэгдэл: 500,000₮"}'
```

Хариу:
```json
{
  "status": "ok",
  "parsed": {
    "bank": "khanbank",
    "amount": 100000,
    "sender_name": "БАТ-ЭРДЭНЭ",
    "reference": "ИНВОЙС-1234",
    "transaction_type": "incoming"
  }
}
```

## Android тохиргоо

1. [SMSForwarder](https://github.com/SunilDhaker/SMSForwarder) суулгах
2. Дүрэм нэмэх:
   - **Sender шүүлтүүр**: `KhanBank` (Khan Bank-ны SMS илгээгчийн нэр)
   - **Үйлдэл**: Webhook рүү илгээх
   - **URL**: `http://ТАНЫ_IP:3456/api/sms`
   - **Арга**: POST
   - **Толгой**: `Content-Type: application/json`
   - **Бие**: `{"sender":"${sender}","message":"${text}","received_at":"${time}"}`

**Анхаар**: Таны MacBook болон Android утас ижил WiFi сүлжээнд байх ёстой.

MacBook-ийн IP хаяг: `ifconfig | grep "inet " | grep -v 127.0.0.1`

## Банк нэмэх

`src/app/api/sms/route.ts` → `BANK_PATTERNS` цувиар нэмнэ:

```typescript
{
    bank: "newbank",
    senders: ["newbank", "нийт банк"],    // SMS илгээгчийн нэр
    amount: /(\d[\d,\.]+)\s*₮/,           // Мөнгөн дүн
    senderName: /илгээгч:\s*([^\s.,]+)/i, // Илгээгчийн нэр
    reference: /утга:\s*([^\s.,]+)/i,     // Гүйлгээний утга
    outgoing: /гарлага|шилжүүлсэн/,       // Гарах гүйлгээ
},
```

## Үйлчилгээний хүснэгт

| Арга | Зам | Тайлбар |
|---|---|---|
| `POST` | `/api/sms` | SMS хүлээн авч, задалж, мэдэгдэл илгээнэ |
| `GET` | `/api/sms` | Эрүүл мэндийн шалгалт + дэмжигдсэн банкууд |

## Хариулагдалт

| Талбар | Утга |
|---|---|
| Нэг SMS задлах хугацаа | <14ms |
| Зардал | $0 |
| Нэмэлтүүд | Next.js, React, React DOM |
| Нөөцлөлт | Telegram Bot API |

## Зорилго

Mongolian банкууд (Khan Bank, Golomt, TDB) нь бизнес эрхлэгчдэд мөнгө орсны мэдэгдлийг SMS-ээр илгээнэ. Энэ систем тэр SMS-ийг хүлээн авч, задалж, танд мэдэгдэл илгээнэ — гар ажиллагаагүйгээр.

## License

MIT
