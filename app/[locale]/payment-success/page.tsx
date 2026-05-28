"use client";
// src/app/payment-success/page.tsx
//
// Vipps redirects here after the user acts in the app:
//   /payment-success?reference=don-xxxxxxxxx
//
// 1. Reads donationData from sessionStorage (stored by DonationForm)
// 2. Polls /api/vipps/payment-status until state is final
// 3. Shows success / cancelled / expired / error screen

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

type FinalState = "loading" | "authorized" | "aborted" | "expired" | "error";

interface DonationData {
	amount: number;
	donorName: string;
	donorEmail: string;
	causeId: string | null;
	donationType: string;
	reference: string;
}

interface PaymentAmount {
	currency: string;
	value: number; // øre
}

function formatNOK(ore: number) {
	return (ore / 100).toLocaleString("nb-NO", {
		style: "currency",
		currency: "NOK",
	});
}

// ─────────────────────────────────────────────────────────────
function PaymentSuccessContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const reference = searchParams.get("reference");

	const [state, setState] = useState<FinalState>("loading");
	const [amount, setAmount] = useState<PaymentAmount | null>(null);
	const [donationData, setDonationData] = useState<DonationData | null>(null);
	const [attempt, setAttempt] = useState(0);

	// Read donation data stored by DonationForm before redirect
	useEffect(() => {
		if (!reference) return;
		try {
			const raw = sessionStorage.getItem(`donation_${reference}`);
			if (raw) setDonationData(JSON.parse(raw));
		} catch {
			// not critical
		}
	}, [reference]);

	// Poll payment status
	useEffect(() => {
		if (!reference) {
			setState("error");
			return;
		}

		let cancelled = false;
		const MAX = 10;
		let count = 0;

		async function poll() {
			if (cancelled) return;

			try {
				const res = await fetch(`/api/vipps/payment-status?reference=${reference}`);
				const data = await res.json();
				count++;
				if (!cancelled) setAttempt(count);

				switch (data.state) {
					case "AUTHORIZED":
						if (!cancelled) {
							setAmount(data.amount);
							setState("authorized");
							// Clean up sessionStorage after success
							sessionStorage.removeItem(`donation_${reference}`);
						}
						return;
					case "ABORTED":
						if (!cancelled) setState("aborted");
						return;
					case "EXPIRED":
						if (!cancelled) setState("expired");
						return;
					case "TERMINATED":
						if (!cancelled) setState("aborted");
						return;
					default:
						// CREATED — still pending
						if (count < MAX) {
							setTimeout(poll, 2500);
						} else if (!cancelled) {
							setState("error");
						}
				}
			} catch {
				if (count < MAX) {
					setTimeout(poll, 2500);
				} else if (!cancelled) {
					setState("error");
				}
			}
		}

		// Brief delay — gives Vipps a moment to update their system after redirect
		const timer = setTimeout(poll, 1500);
		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [reference]);

	// ── Loading ────────────────────────────────────────────────
	if (state === "loading") {
		return (
			<Shell>
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
						<svg className="animate-spin h-8 w-8 text-orange-500" viewBox="0 0 24 24" fill="none">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
						</svg>
					</div>
					<h2 className="text-xl font-bold text-gray-900">Confirming your donation…</h2>
					<p className="text-sm text-gray-500">Checking with Vipps{attempt > 0 ? ` (${attempt}/10)` : ""}…</p>
					<p className="text-xs text-gray-400">If you approved in the Vipps app, this will update in a moment.</p>
				</div>
			</Shell>
		);
	}

	// ── Authorized / Success ───────────────────────────────────
	if (state === "authorized") {
		return (
			<Shell>
				<div className="flex flex-col items-center gap-5 text-center">
					<div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
						<svg className="w-10 h-10 text-green-600" viewBox="0 0 24 24" fill="none">
							<circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
							<path d="M7 12l4 4 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>

					<div>
						<h2 className="text-2xl font-bold text-gray-900 mb-1">Donation received!</h2>
						{amount && <p className="text-3xl font-extrabold text-green-600">{formatNOK(amount.value)}</p>}
					</div>

					{donationData && (
						<div className="bg-gray-50 rounded-xl p-4 w-full text-left space-y-1.5 text-sm">
							{donationData.donorName && donationData.donorName !== "Anonymous" && <Row label="Name" value={donationData.donorName} />}
							{donationData.donorEmail && donationData.donorEmail !== "anonymous@rspnorway.org" && <Row label="Email" value={donationData.donorEmail} />}
							<Row label="Reference" value={donationData.reference} mono />
						</div>
					)}

					<p className="text-sm text-gray-500">Thank you for your generous contribution. A confirmation email will be sent shortly.</p>

					<div className="flex items-center gap-2 text-xs text-gray-400">
						<span>Paid securely with</span>
						<Image src="/Vipps.webp" alt="Vipps" width={40} height={40} className="w-8 rounded-full" />
					</div>

					<button onClick={() => router.push("/")} className="w-full py-3 bg-brand_primary hover:bg-brand_primary/90 text-gray-700 font-bold rounded-lg transition">
						Back to home
					</button>
				</div>
			</Shell>
		);
	}

	// ── Aborted / Cancelled ────────────────────────────────────
	if (state === "aborted") {
		return (
			<Shell>
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
						<svg className="w-8 h-8 text-yellow-600" viewBox="0 0 24 24" fill="none">
							<path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
					</div>
					<h2 className="text-xl font-bold text-gray-900">Payment cancelled</h2>
					<p className="text-sm text-gray-500">You cancelled the payment in Vipps. No money has been charged.</p>
					<button onClick={() => router.back()} className="w-full py-3 bg-brand_primary hover:bg-brand_primary/90 text-gray-700 font-bold rounded-lg transition">
						Try again
					</button>
				</div>
			</Shell>
		);
	}

	// ── Expired ────────────────────────────────────────────────
	if (state === "expired") {
		return (
			<Shell>
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
						<svg className="w-8 h-8 text-gray-500" viewBox="0 0 24 24" fill="none">
							<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
						</svg>
					</div>
					<h2 className="text-xl font-bold text-gray-900">Session expired</h2>
					<p className="text-sm text-gray-500">The Vipps payment session timed out before it was completed. No money was charged.</p>
					<button onClick={() => router.back()} className="w-full py-3 bg-brand_primary hover:bg-brand_primary/90 text-gray-700 font-bold rounded-lg transition">
						Start new donation
					</button>
				</div>
			</Shell>
		);
	}

	// ── Error / Unknown ────────────────────────────────────────
	return (
		<Shell>
			<div className="flex flex-col items-center gap-4 text-center">
				<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
					<svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none">
						<path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
					</svg>
				</div>
				<h2 className="text-xl font-bold text-gray-900">Something went wrong</h2>
				<p className="text-sm text-gray-500">We couldn&apos;t confirm your payment status. Please check your Vipps app. If money was charged, contact us with reference: {reference && <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{reference}</code>}</p>
				<button onClick={() => router.push("/")} className="w-full py-3 bg-brand_primary hover:bg-brand_primary/90 text-gray-700 font-bold rounded-lg transition">
					Go home
				</button>
			</div>
		</Shell>
	);
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
	return (
		<main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">{children}</div>
		</main>
	);
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="flex justify-between gap-4">
			<span className="text-gray-500">{label}</span>
			<span className={`text-gray-900 font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
		</div>
	);
}

// ─────────────────────────────────────────────────────────────
export default function PaymentSuccessPage() {
	return (
		<Suspense
			fallback={
				<main className="min-h-screen bg-gray-50 flex items-center justify-center">
					<p className="text-gray-400 text-sm">Loading…</p>
				</main>
			}
		>
			<PaymentSuccessContent />
		</Suspense>
	);
}
