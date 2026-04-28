'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface CartDrawerProps {
	children: React.ReactNode;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ children }) => {
	const { 
		cart, 
		removeFromCart, 
		updateQuantity, 
		clearCart, 
		getItemCount,
		error 
	} = useCart();

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('nb-NO', {
			style: 'currency',
			currency: 'NOK'
		}).format(price);
	};

	const handleQuantityChange = (productId: string, newQuantity: number) => {
		if (newQuantity < 1) {
			removeFromCart(productId);
		} else {
			updateQuantity(productId, newQuantity);
		}
	};

	const handleRemoveItem = (productId: string) => {
		removeFromCart(productId);
		toast.success('Item removed from cart');
	};

	const handleClearCart = () => {
		clearCart();
		toast.success('Cart cleared');
	};

	const itemTotal = getItemCount();

	return (
		<Sheet>
			<SheetTrigger asChild>
				{children}
			</SheetTrigger>
			<SheetContent className="w-full sm:max-w-lg overflow-y-auto">
				<SheetHeader>
					<SheetTitle className="flex items-center justify-between">
						<span className="flex items-center gap-2">
							<ShoppingCart className="w-5 h-5" />
							Shopping Cart ({itemTotal})
						</span>
						{cart.items.length > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearCart}
								className="text-red-500 hover:text-red-700"
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						)}
					</SheetTitle>
				</SheetHeader>

				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
						{error}
					</div>
				)}

				<div className="mt-6 space-y-4">
					{cart.items.length === 0 ? (
						<div className="text-center py-12">
							<ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
							<h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
							<p className="text-gray-600">Add some items to get started!</p>
						</div>
					) : (
						<>
							{/* Cart Items */}
							<div className="space-y-4">
								{cart.items.map((item) => {
									const productName = item.product.name.en || item.product.name['en'] || 'Product';
									const productDescription = item.product.description.en || item.product.description['en'];
									
									return (
										<div key={item.product._id} className="bg-white border rounded-lg p-4 space-y-3">
											<div className="flex items-start gap-3">
												<Image
													src={item.product.imageUrl}
													alt={productName}
													width={64}
													height={64}
													className="w-16 h-16 object-cover rounded-md"
												/>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-sm line-clamp-1">{productName}</h4>
													<p className="text-xs text-gray-500 line-clamp-2">{productDescription}</p>
													<div className="flex items-center gap-2 mt-1">
														<Badge variant="outline" className="text-xs">
															{item.product.type}
														</Badge>
														{item.product.isDigital && (
															<Badge variant="secondary" className="text-xs">
																Digital
															</Badge>
														)}
													</div>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRemoveItem(item.product._id)}
													className="text-red-500 hover:text-red-700 p-1"
												>
													<X className="w-4 h-4" />
												</Button>
											</div>

											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
														disabled={item.quantity <= 1}
														className="w-8 h-8 p-0"
													>
														<Minus className="w-3 h-3" />
													</Button>
													<span className="w-8 text-center text-sm font-medium">
														{item.quantity}
													</span>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
														disabled={!item.product.isDigital && item.product.stockQuantity !== undefined && item.quantity >= item.product.stockQuantity}
														className="w-8 h-8 p-0"
													>
														<Plus className="w-3 h-3" />
													</Button>
												</div>
												<div className="text-right">
													<div className="font-semibold">
														{formatPrice(item.product.price * item.quantity)}
													</div>
													<div className="text-xs text-gray-500">
														{formatPrice(item.product.price)} each
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<Separator />

							{/* Cart Summary */}
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

							{/* Checkout Button */}
							<Button 
								className="w-full mt-6" 
								size="lg"
								onClick={() => {
									window.location.href = '/checkout';
								}}
							>
								Proceed to Checkout
							</Button>

							<div className="text-xs text-gray-500 text-center">
								Secure checkout powered by Stripe
							</div>
						</>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default CartDrawer;
