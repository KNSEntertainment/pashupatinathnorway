'use client';

import React, { useEffect, useState, use, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ArrowLeft, Home, Mail } from 'lucide-react';

interface OrderItem {
	productSnapshot: {
		name: { en: string; no?: string };
		type?: string;
	};
	quantity: number;
	price: number;
}

interface OrderDetails {
	_id: string;
	createdAt: string;
	status: string;
	paymentStatus: string;
	customerInfo: {
		name: string;
		email: string;
	};
	items: OrderItem[];
	total: number;
}

interface SuccessPageProps {
	params: Promise<{ locale: string }>;
}

const SuccessPage: React.FC<SuccessPageProps> = ({ params }) => {
	const resolvedParams = use(params) as { locale: string };
	const searchParams = useSearchParams();
	const router = useRouter();
	const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
	const [loading, setLoading] = useState(true);

	const sessionId = searchParams.get('session_id');

	const fetchOrderDetails = useCallback(async () => {
		try {
			const response = await fetch(`/api/store/order-details?session_id=${sessionId}`);
			if (response.ok) {
				const data = await response.json();
				setOrderDetails(data);
			}
		} catch (error) {
			console.error('Error fetching order details:', error);
		} finally {
			setLoading(false);
		}
	}, [sessionId]);

	useEffect(() => {
		if (sessionId) {
			fetchOrderDetails();
		}
	}, [sessionId, fetchOrderDetails]);

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat(resolvedParams.locale === 'no' ? 'nb-NO' : 'en-US', {
			style: 'currency',
			currency: 'NOK'
		}).format(price);
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p>Processing your order...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-2xl mx-auto">
				{/* Success Message */}
				<div className="text-center mb-8">
					<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
					<h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
					<p className="text-gray-600">
						Thank you for your purchase. Your order has been confirmed and will be processed shortly.
					</p>
				</div>

				{/* Order Details */}
				{orderDetails && (
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="w-5 h-5" />
								Order Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="font-medium">Order ID:</span>
									<p className="text-gray-600">{orderDetails._id}</p>
								</div>
								<div>
									<span className="font-medium">Date:</span>
									<p className="text-gray-600">
										{new Date(orderDetails.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div>
									<span className="font-medium">Status:</span>
									<p className="text-green-600 capitalize">{orderDetails.status}</p>
								</div>
								<div>
									<span className="font-medium">Payment:</span>
									<p className="text-green-600 capitalize">{orderDetails.paymentStatus}</p>
								</div>
							</div>

							<div>
								<span className="font-medium">Customer:</span>
								<p className="text-gray-600">{orderDetails.customerInfo.name}</p>
								<p className="text-gray-600">{orderDetails.customerInfo.email}</p>
							</div>

							<div>
								<span className="font-medium">Items:</span>
								<div className="space-y-2 mt-2">
									{orderDetails.items.map((item: OrderItem, index: number) => (
										<div key={index} className="flex justify-between text-sm">
											<div>
												{item.quantity} × {item.productSnapshot.name.en}
												{item.productSnapshot.type && (
													<span className="text-gray-500 ml-2">({item.productSnapshot.type})</span>
												)}
											</div>
											<span>{formatPrice(item.price * item.quantity)}</span>
										</div>
									))}
								</div>
							</div>

							<div className="border-t pt-4">
								<div className="flex justify-between font-semibold text-lg">
									<span>Total:</span>
									<span>{formatPrice(orderDetails.total)}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Next Steps */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>What&apos;s Next?</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-start gap-3">
							<Mail className="w-5 h-5 text-blue-500 mt-0.5" />
							<div>
								<div className="font-medium">Order Confirmation Email</div>
								<div className="text-sm text-gray-600">
									You&apos;ll receive an email with your order details and receipt.
								</div>
							</div>
						</div>
						
						{orderDetails?.items.some((item: OrderItem) => !item.productSnapshot.type?.includes('digital')) && (
							<div className="flex items-start gap-3">
								<Package className="w-5 h-5 text-blue-500 mt-0.5" />
								<div>
									<div className="font-medium">Shipping Information</div>
									<div className="text-sm text-gray-600">
										Physical products will be shipped within 2-3 business days.
									</div>
								</div>
							</div>
						)}
						
						{orderDetails?.items.some((item: OrderItem) => item.productSnapshot.type?.includes('digital')) && (
							<div className="flex items-start gap-3">
								<Package className="w-5 h-5 text-blue-500 mt-0.5" />
								<div>
									<div className="font-medium">Digital Products</div>
									<div className="text-sm text-gray-600">
										Access to digital products will be sent to your email.
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row gap-4">
					<Button 
						onClick={() => router.push('/store')}
						className="flex-1"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Continue Shopping
					</Button>
					<Button 
						variant="outline"
						onClick={() => router.push('/')}
						className="flex-1"
					>
						<Home className="w-4 h-4 mr-2" />
						Back to Home
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SuccessPage;
