"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt } from "lucide-react";
import Link from "next/link";

export default function DonationSuccessPage() {
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session_id");
	const [loading, setLoading] = useState(true);
	// const [donationDetails, setDonationDetails] = useState<any>(null);

	useEffect(() => {
		if (sessionId) {
			// Optionally fetch donation details from your API
			setLoading(false);
		}
	}, [sessionId]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-12">
			<Card className="w-full max-w-2xl shadow-2xl border-0">
				<CardHeader className="bg-gradient-to-r from-success to-emerald-600 text-white text-center py-12">
					<div className="flex justify-center mb-4">
						<div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
							<CheckCircle className="w-12 h-12 text-success" />
						</div>
					</div>
					<CardTitle className="text-3xl mb-2">Thank You for Your Donation!</CardTitle>
					<p className="text-white/90 text-lg">Your generous support means the world to us</p>
				</CardHeader>
				<CardContent className="pt-8 pb-8 space-y-6">
					<div className="text-center space-y-4">
						<p className="text-gray-600">Your donation has been processed successfully. You will receive a confirmation email shortly with your receipt.</p>

						{sessionId && (
							<div className="bg-light p-4 rounded-lg">
								<p className="text-sm text-gray-500 mb-1">Transaction ID</p>
								<p className="text-xs font-mono text-gray-900 break-all">{sessionId}</p>
							</div>
						)}
					</div>

					<div className="bg-gradient-to-r from-brand/10 to-blue-50 p-6 rounded-lg">
						<h3 className="font-bold text-gray-900 mb-3">What Happens Next?</h3>
						<ul className="space-y-2 text-sm text-gray-600">
							<li className="flex items-start gap-2">
								<span className="text-brand">✓</span>
								<span>You&apos;ll receive a detailed receipt via email</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-brand">✓</span>
								<span>Your donation will directly support PNSB-Norway&apos;s programs</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-brand">✓</span>
								<span>You can track how we use donations in our annual reports</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="text-brand">✓</span>
								<span>Consider joining our membership program for more involvement</span>
							</li>
						</ul>
					</div>

					<div className="flex gap-3 justify-center pt-4">
						<Link href="/en">
							<Button variant="outline" className="gap-2">
								<Home className="w-4 h-4" />
								Back to Home
							</Button>
						</Link>
						<Link href="/en/membership">
							<Button className="bg-brand hover:bg-brand/90 gap-2">
								<Receipt className="w-4 h-4" />
								Become a Member
							</Button>
						</Link>
					</div>

					<div className="text-center pt-4 border-t border-gray-200">
						<p className="text-sm text-gray-500">Questions? Contact us at contact@rspnorway.org</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
