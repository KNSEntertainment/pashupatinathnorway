// src/app/api/vipps/payment-status/route.ts
//
// Called by /payment-success page: GET /api/vipps/payment-status?reference=xxx
// Returns: { reference, state, amount }
//
// Also auto-captures the payment when state === "AUTHORIZED".

import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getVippsPaymentStatus, captureVippsPayment } from "@/lib/vipps";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const reference = searchParams.get("reference");

		if (!reference) {
			return NextResponse.json({ error: "reference query param is required" }, { status: 400 });
		}

		const accessToken = await getAccessToken();
		const status = await getVippsPaymentStatus(accessToken, reference);

		// ── Auto-capture on AUTHORIZED ─────────────────────────────
		// Captures the full amount. For deferred capture (e.g. on shipment),
		// remove this block and call captureVippsPayment separately.
		if (status.state === "AUTHORIZED") {
			try {
				await captureVippsPayment(accessToken, reference, status.amount.value);
				console.log(`[Vipps] Captured payment ${reference} (${status.amount.value} øre)`);
			} catch (captureErr) {
				// Already captured? Log and continue — don't fail the status response.
				console.warn("[Vipps] Capture warning (may already be captured):", captureErr);
			}
		}

		return NextResponse.json({
			reference: status.reference,
			state: status.state, // CREATED | AUTHORIZED | ABORTED | EXPIRED | TERMINATED
			amount: status.amount, // { currency: "NOK", value: <øre> }
		});
	} catch (error) {
		console.error("[Vipps] payment-status error:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch payment status",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
