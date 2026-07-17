import { NextResponse } from "next/server";

interface SmsPayload {
	sender: string;
	message: string;
	received_at?: string;
}

interface ParsedPayment {
	bank: string;
	amount: number;
	sender_name: string | null;
	reference: string | null;
	transaction_type: "incoming" | "outgoing";
}

// ─── Bank SMS patterns ──────────────────────────────────────────────────────

const BANK_PATTERNS = [
	{
		bank: "khanbank",
		senders: ["khanbank", "khan bank", "хаан банк", "хаанбанк"],
		amount: /(\d[\d,\.]+)\s*₮/,
		senderName: /илгээгч:\s*([^\s.,]+)/i,
		reference: /утга:\s*([^\s.,]+)/i,
		outgoing: /гарлага|шилжүүлсэн|тооцоо/,
	},
	{
		bank: "golomt",
		senders: ["golomt", "голомт"],
		amount: /(\d[\d,\.]+)\s*₮/,
		senderName: /илгээгч:\s*([^\s.,]+)/i,
		reference: /утга:\s*([^\s.,]+)/i,
		outgoing: /гарлага|шилжүүлсэн/,
	},
];

function parseSms(message: string, sender: string): ParsedPayment | null {
	const senderLower = sender.toLowerCase();
	const combined = `${senderLower} ${message.toLowerCase()}`;

	for (const p of BANK_PATTERNS) {
		if (!p.senders.some((s) => combined.includes(s))) continue;

		const amountMatch = message.match(p.amount);
		if (!amountMatch) continue;

		const amount = Number.parseFloat(amountMatch[1].replace(/,/g, ""));
		if (Number.isNaN(amount) || amount <= 0) continue;

		return {
			bank: p.bank,
			amount,
			sender_name: message.match(p.senderName)?.[1] ?? null,
			reference: message.match(p.reference)?.[1] ?? null,
			transaction_type: p.outgoing.test(message) ? "outgoing" : "incoming",
		};
	}
	return null;
}

// ─── Telegram notification ──────────────────────────────────────────────────

async function notifyTelegram(payment: ParsedPayment): Promise<void> {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const chatId = process.env.TELEGRAM_CHAT_ID;
	if (!token || !chatId) return;

	const emoji = payment.transaction_type === "incoming" ? "💰" : "💸";
	const text = [
		`${emoji} *Төлбөр ирлээ*`,
		"",
		`Банк: ${payment.bank}`,
		`Дүн: ${payment.amount.toLocaleString()}₮`,
		payment.sender_name ? `Илгээгч: ${payment.sender_name}` : "",
		payment.reference ? `Утга: ${payment.reference}` : "",
	].filter(Boolean).join("\n");

	await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
	});
}

// ─── Webhook secret verification ────────────────────────────────────────────

function isAuthorized(request: Request): boolean {
	const secret = process.env.SMS_WEBHOOK_SECRET;
	if (!secret) return true;
	return request.headers.get("authorization") === `Bearer ${secret}`;
}

// ─── Route handlers ─────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
	if (!isAuthorized(request)) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = (await request.json()) as SmsPayload;
		const { sender, message } = body;

		if (!sender || !message) {
			return NextResponse.json({ error: "Missing sender or message" }, { status: 400 });
		}

		const parsed = parseSms(message, sender);
		if (!parsed) {
			return NextResponse.json({ status: "no_match", message: "No bank pattern matched" });
		}

		await notifyTelegram(parsed);

		console.log(`[sms-pay] ${parsed.bank} ${parsed.amount}₮ from ${parsed.sender_name ?? "?"} ref=${parsed.reference ?? "?"}`);

		return NextResponse.json({ status: "ok", parsed });
	} catch (err) {
		const error = err instanceof Error ? err.message : String(err);
		console.error(`[sms-pay] Error: ${error}`);
		return NextResponse.json({ error }, { status: 500 });
	}
}

export async function GET(): Promise<NextResponse> {
	return NextResponse.json({
		status: "ok",
		service: "sms-pay",
		banks: BANK_PATTERNS.map((p) => p.bank),
		timestamp: new Date().toISOString(),
	});
}
