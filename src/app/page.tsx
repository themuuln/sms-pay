export default function Home() {
	return (
		<main style={{ padding: "2rem", fontFamily: "system-ui" }}>
			<h1>📱 SMS Pay</h1>
			<p>SMS-аар төлбөр баталгаажуулах систем</p>

			<div style={{ marginTop: "2rem" }}>
				<h2>Ажиллах зарчим</h2>
				<ol>
					<li>Android утас → SMSForwarder апп → Khan Bank SMS илгээнэ</li>
					<li>API endpoint → AI-аар задлана (GPT-4o-mini, ~$0.00005/call)</li>
					<li>Supabase-д хадгална</li>
					<li>Telegram-р мэдэгдэл илгээнэ</li>
				</ol>
			</div>

			<div style={{ marginTop: "2rem" }}>
				<h2>API</h2>
				<pre
					style={{
						background: "#f5f5f5",
						padding: "1rem",
						borderRadius: "8px",
					}}
				>
{`POST /api/sms
{
  "sender": "KhanBank",
  "message": "Таны дансанд 100,000₮ орлого орлоо...",
  "received_at": "2026-07-18T10:30:00Z"
}`}
				</pre>
			</div>

			<div style={{ marginTop: "2rem" }}>
				<h2>Төлбөрүүд</h2>
				<p>
					<a href="/api/sms">GET /api/sms</a> — Сүүлийн төлбөрүүдийг харах
				</p>
			</div>
		</main>
	);
}
