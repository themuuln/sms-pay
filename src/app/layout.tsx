import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "SMS Pay — Төлбөр баталгаажуулалт",
	description: "SMS-аар төлбөр баталгаажуулах систем",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="mn">
			<body>{children}</body>
		</html>
	);
}
