'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, CreditCard, Truck, Package, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CheckoutPageProps {
	params: Promise<{ locale: string }>;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ params }) => {
	const resolvedParams = use(params) as { locale: string };
	// const t = useTranslations('checkout');
	const router = useRouter();
	const { cart, clearCart } = useCart();
	const [isProcessing, setIsProcessing] = useState(false);
	
	const [formData, setFormData] = useState({
		customerInfo: {
			name: '',
			email: '',
			phone: '',
			address: '',
			city: '',
			postalCode: ''
		},
		billingAddress: {
			address: '',
			city: '',
			postalCode: ''
		},
		notes: ''
	});

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat(resolvedParams.locale === 'no' ? 'nb-NO' : 'en-US', {
			style: 'currency',
			currency: 'NOK'
		}).format(price);
	};

	const handleInputChange = (section: 'customerInfo' | 'billingAddress' | 'notes', field: string, value: string) => {
		if (section === 'notes') {
			setFormData(prev => ({ ...prev, notes: value }));
		} else {
			setFormData(prev => ({
				...prev,
				[section]: {
					...prev[section],
					[field]: value
				}
			}));
		}
	};

	const validateForm = () => {
		const { customerInfo } = formData;
		
		if (!customerInfo.name.trim()) {
			toast.error('Name is required');
			return false;
		}
		if (!customerInfo.email.trim()) {
			toast.error('Email is required');
			return false;
		}
		if (!customerInfo.phone.trim()) {
			toast.error('Phone is required');
			return false;
		}
		
		// Check if any physical products require shipping info
		const hasPhysicalProducts = cart.items.some(item => !item.product.isDigital);
		if (hasPhysicalProducts) {
			if (!customerInfo.address.trim()) {
				toast.error('Address is required for physical products');
				return false;
			}
			if (!customerInfo.city.trim()) {
				toast.error('City is required for physical products');
				return false;
			}
			if (!customerInfo.postalCode.trim()) {
				toast.error('Postal code is required for physical products');
				return false;
			}
		}
		
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validateForm()) return;
		
		setIsProcessing(true);
		
		try {
			const response = await fetch('/api/store/checkout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					customerInfo: formData.customerInfo,
					items: cart.items,
					total: cart.total,
					subtotal: cart.subtotal,
					tax: cart.tax,
					shipping: cart.shipping,
					currency: cart.currency,
					notes: formData.notes
				}),
			});

			const data = await response.json();

			if (response.ok && data.url) {
				// Clear cart and redirect to Stripe
				clearCart();
				window.location.href = data.url;
			} else {
				toast.error(data.error || 'Failed to create checkout session');
			}
		} catch (error) {
			console.error('Checkout error:', error);
			toast.error('An error occurred during checkout');
		} finally {
			setIsProcessing(false);
		}
	};

	if (cart.items.length === 0) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
					<h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
					<p className="text-gray-600 mb-4">Add some items to proceed with checkout</p>
					<Button onClick={() => router.push('/store')}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Store
					</Button>
				</div>
			</div>
		);
	}

	const hasPhysicalProducts = cart.items.some(item => !item.product.isDigital);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6">
				<Button 
					variant="ghost" 
					onClick={() => router.back()}
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>
				<h1 className="text-3xl font-bold">Checkout</h1>
			</div>

			<form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Customer Information */}
				<div className="lg:col-span-2 space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="w-5 h-5" />
								Customer Information
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<Label htmlFor="name">Full Name *</Label>
									<Input
										id="name"
										value={formData.customerInfo.name}
										onChange={(e) => handleInputChange('customerInfo', 'name', e.target.value)}
										required
									/>
								</div>
								<div>
									<Label htmlFor="email">Email *</Label>
									<Input
										id="email"
										type="email"
										value={formData.customerInfo.email}
										onChange={(e) => handleInputChange('customerInfo', 'email', e.target.value)}
										required
									/>
								</div>
							</div>
							<div>
								<Label htmlFor="phone">Phone *</Label>
								<Input
									id="phone"
									type="tel"
									value={formData.customerInfo.phone}
									onChange={(e) => handleInputChange('customerInfo', 'phone', e.target.value)}
									required
								/>
							</div>
						</CardContent>
					</Card>

					{/* Shipping Address (for physical products) */}
					{hasPhysicalProducts && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Truck className="w-5 h-5" />
									Shipping Address
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="address">Street Address *</Label>
									<Input
										id="address"
										value={formData.customerInfo.address}
										onChange={(e) => handleInputChange('customerInfo', 'address', e.target.value)}
										required
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Label htmlFor="city">City *</Label>
										<Input
											id="city"
											value={formData.customerInfo.city}
											onChange={(e) => handleInputChange('customerInfo', 'city', e.target.value)}
											required
										/>
									</div>
									<div>
										<Label htmlFor="postalCode">Postal Code *</Label>
										<Input
											id="postalCode"
											value={formData.customerInfo.postalCode}
											onChange={(e) => handleInputChange('customerInfo', 'postalCode', e.target.value)}
											required
										/>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Order Notes */}
					<Card>
						<CardHeader>
							<CardTitle>Order Notes (Optional)</CardTitle>
						</CardHeader>
						<CardContent>
							<textarea
								className="w-full p-3 border rounded-md resize-none"
								rows={4}
								placeholder="Add any special instructions or notes for your order..."
								value={formData.notes}
								onChange={(e) => handleInputChange('notes', '', e.target.value)}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Order Summary */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="w-5 h-5" />
								Order Summary
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							{cart.items.map((item) => {
								const productName = item.product.name[resolvedParams.locale as keyof typeof item.product.name] || item.product.name.en;
								
								return (
									<div key={item.product._id} className="flex justify-between items-start">
										<div className="flex-1">
											<div className="font-medium text-sm">{productName}</div>
											<div className="text-xs text-gray-500">
												{item.quantity} × {formatPrice(item.product.price)}
											</div>
											{item.product.isDigital && (
												<Badge variant="secondary" className="text-xs mt-1">
													Digital
												</Badge>
											)}
										</div>
										<span className="font-medium">
											{formatPrice(item.product.price * item.quantity)}
										</span>
									</div>
								);
							})}
							
							<Separator />
							
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Subtotal</span>
									<span>{formatPrice(cart.subtotal)}</span>
								</div>
								{cart.tax > 0 && (
									<div className="flex justify-between text-sm">
										<span>Tax (25%)</span>
										<span>{formatPrice(cart.tax)}</span>
									</div>
								)}
								{cart.shipping > 0 && (
									<div className="flex justify-between text-sm">
										<span>Shipping</span>
										<span>{formatPrice(cart.shipping)}</span>
									</div>
								)}
								<Separator />
								<div className="flex justify-between font-semibold text-lg">
									<span>Total</span>
									<span>{formatPrice(cart.total)}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Payment Method */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="w-5 h-5" />
								Payment Method
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="bg-gray-50 p-4 rounded-lg">
								<div className="flex items-center gap-3">
									<div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
										<span className="text-white text-xs font-bold">STRIPE</span>
									</div>
									<div>
										<div className="font-medium text-sm">Secure Payment</div>
										<div className="text-xs text-gray-600">Pay with credit/debit card</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Submit Button */}
					<Button 
						type="submit" 
						className="w-full" 
						size="lg"
						disabled={isProcessing}
					>
						{isProcessing ? (
							'Processing...'
						) : (
							<>
								<CreditCard className="w-4 h-4 mr-2" />
								Proceed to Payment - {formatPrice(cart.total)}
							</>
						)}
					</Button>

					<div className="text-xs text-gray-500 text-center">
						By completing this purchase, you agree to our terms of service and privacy policy.
					</div>
				</div>
			</form>
		</div>
	);
};

export default CheckoutPage;
