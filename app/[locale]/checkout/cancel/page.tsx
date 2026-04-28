'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ShoppingCart, Home } from 'lucide-react';

interface CancelPageProps {
	params: Promise<{ locale: string }>;
}

const CancelPage: React.FC<CancelPageProps> = () => {
	const router = useRouter();

	const handleReturnToStore = () => {
		router.push('/store');
	};

	const handleTryAgain = () => {
		router.push('/checkout');
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				{/* Cancel Message */}
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<X className="w-8 h-8 text-red-500" />
					</div>
					<h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
					<p className="text-gray-600">
						Your payment was cancelled. No charges were made to your account.
					</p>
				</div>

				{/* Information Card */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<ShoppingCart className="w-5 h-5" />
							What happened?
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3 text-gray-600">
							<p>
								You cancelled the payment process. Your cart items are still saved and you can try again whenever you&apos;re ready.
							</p>
							<p>
								If you encountered any issues during checkout, please contact our support team for assistance.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Button
						onClick={handleTryAgain}
						className="flex-1 sm:flex-none"
						size="lg"
					>
						Try Checkout Again
					</Button>
					<Button
						onClick={handleReturnToStore}
						variant="outline"
						className="flex-1 sm:flex-none"
						size="lg"
					>
						Return to Store
					</Button>
				</div>

				{/* Additional Options */}
				<div className="mt-8 text-center">
					<p className="text-sm text-gray-500 mb-4">
						Need help? Here are some options:
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button
							onClick={() => router.push('/contact')}
							variant="ghost"
							size="sm"
						>
							Contact Support
						</Button>
						<Button
							onClick={() => router.push('/')}
							variant="ghost"
							size="sm"
						>
							<Home className="w-4 h-4 mr-2" />
							Home
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CancelPage;
