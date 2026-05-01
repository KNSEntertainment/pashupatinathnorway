'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Package, Calendar, Tag, Star, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductDetailPageProps {
	params: Promise<{ locale: string; slug: string }>;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ params }) => {
	const resolvedParams = use(params) as { locale: string; slug: string };
	const router = useRouter();
	const { addToCart } = useCart();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [quantity, setQuantity] = useState(1);
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	const fetchProduct = useCallback(async () => {
		try {
			const response = await fetch(`/api/products/${resolvedParams.slug}`);
			if (response.ok) {
				const data = await response.json();
				setProduct(data.product);
			} else {
				toast.error('Product not found');
				router.push('/store');
			}
		} catch (error) {
			console.error('Error fetching product:', error);
			toast.error('Failed to load product');
			router.push('/store');
		} finally {
			setLoading(false);
		}
	}, [resolvedParams.slug, router]);

	useEffect(() => {
		fetchProduct();
	}, [resolvedParams.slug, fetchProduct]);

	const handleAddToCart = () => {
		console.log('handleAddToCart called');
		console.log('Product:', product);
		console.log('Quantity:', quantity);
		console.log('Can add to cart:', canAddToCart());
		
		if (product) {
			addToCart(product, quantity);
			toast.success(`${getProductName()} added to cart`);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	const handleBuyNow = async () => {
		console.log('handleBuyNow called');
		console.log('Product:', product);
		console.log('Locale:', resolvedParams.locale);
		
		if (!product) {
			toast.error('Product not available');
			return;
		}
		
		// Add to cart first
		addToCart(product, quantity);
		toast.success(`${getProductName()} added to cart`);
		
		// Small delay to ensure cart state is updated
		await new Promise(resolve => setTimeout(resolve, 100));
		
		// Navigate to checkout
		router.push(`/${resolvedParams.locale}/checkout`);
	};

	const getProductName = () => {
		if (!product) return '';
		return product.name[resolvedParams.locale as keyof typeof product.name] || product.name.en;
	};

	const getProductDescription = () => {
		if (!product) return '';
		return product.description[resolvedParams.locale as keyof typeof product.description] || product.description.en;
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat('nb-NO', {
			style: 'currency',
			currency: 'NOK'
		}).format(price);
	};

	const isInStock = () => {
		return product?.isDigital || product?.inStock;
	};

	const canAddToCart = () => {
		if (!product) return false;
		if (product.isDigital) return true;
		if (!product.inStock) return false;
		if (product.stockQuantity !== undefined && product.stockQuantity > 0) return true;
		return false;
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="animate-pulse">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						<div className="aspect-square bg-gray-200 rounded-lg"></div>
						<div className="space-y-4">
							<div className="h-8 bg-gray-200 rounded"></div>
							<div className="h-4 bg-gray-200 rounded w-3/4"></div>
							<div className="h-32 bg-gray-200 rounded"></div>
							<div className="h-12 bg-gray-200 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!product) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center py-12">
					<h2 className="text-2xl font-bold mb-4">Product not found</h2>
					<Button onClick={() => router.push('/store')}>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Store
					</Button>
				</div>
			</div>
		);
	}

	const allImages = product.imageUrl ? [product.imageUrl, ...(product.images || [])] : (product.images || []);

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Back Button */}
			<Button
				variant="ghost"
				onClick={() => router.back()}
				className="mb-6"
			>
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back to Store
			</Button>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Product Images */}
				<div className="space-y-4">
					<div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
						{allImages[selectedImageIndex] && (
							<Image
								src={allImages[selectedImageIndex]}
								alt={getProductName() || 'Product image'}
								width={600}
								height={600}
								className="w-full h-full object-cover"
							/>
						)}
					</div>
					
					{/* Image Thumbnails */}
					{allImages.length > 1 && (
						<div className="flex gap-2 overflow-x-auto">
							{allImages.map((image, index) => (
								<button
									key={index}
									onClick={() => setSelectedImageIndex(index)}
									className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
										selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
									}`}
								>
									<Image
										src={image}
										alt={`${getProductName()} ${index + 1}`}
										width={80}
										height={80}
										className="w-full h-full object-cover"
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Product Information */}
				<div className="space-y-6">
					{/* Title and Category */}
					<div>
						<div className="flex items-center gap-2 mb-2">
							<Badge variant={product.category === 'product' ? 'default' : 'secondary'}>
								{product.category === 'product' ? (
									<><Package className="w-3 h-3 mr-1" /> Product</>
								) : (
									<><Calendar className="w-3 h-3 mr-1" /> Service</>
								)}
							</Badge>
							{product.isDigital && (
								<Badge variant="outline">Digital</Badge>
							)}
						</div>
						<h1 className="text-3xl font-bold mb-2">{getProductName()}</h1>
						<p className="text-2xl font-bold text-green-700">{formatPrice(product.price)}</p>
					</div>

					{/* Stock Status */}
					<div className="flex items-center gap-2">
						{isInStock() ? (
							<div className="flex items-center gap-2 text-green-600">
								<Check className="w-5 h-5" />
								<span>
									{product.isDigital ? 'Digital Product' : 
									 product.stockQuantity ? `${product.stockQuantity} in stock` : 'In Stock'}
								</span>
							</div>
						) : (
							<div className="flex items-center gap-2 text-red-600">
								<X className="w-5 h-5" />
								<span>Out of Stock</span>
							</div>
						)}
					</div>

					{/* Description */}
					<div>
						<h3 className="text-lg font-semibold mb-2">Description</h3>
						<p className="text-gray-600 leading-relaxed">{getProductDescription()}</p>
					</div>

					{/* Features */}
					{product.features && product.features.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-2">Features</h3>
							<div className="space-y-2">
								{product.features.map((feature, index) => {
									const featureText = feature[resolvedParams.locale as keyof typeof feature] || feature.en;
									return featureText ? (
										<div key={index} className="flex items-center gap-2">
											<Star className="w-4 h-4 text-yellow-500" />
											<span>{featureText}</span>
										</div>
									) : null;
								})}
							</div>
						</div>
					)}

					{/* Specifications */}
					{product.specifications && Object.keys(product.specifications).length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-2">Specifications</h3>
							<Card>
								<CardContent className="pt-6">
									<div className="space-y-3">
										{Object.entries(product.specifications).map(([key, spec]) => {
											const specText = spec[resolvedParams.locale as keyof typeof spec] || spec.en;
											return specText ? (
												<div key={key} className="flex justify-between">
													<span className="font-medium">{key}:</span>
													<span>{specText}</span>
												</div>
											) : null;
										})}
									</div>
								</CardContent>
							</Card>
						</div>
					)}

					{/* Tags */}
					{product.tags && product.tags.length > 0 && (
						<div>
							<h3 className="text-lg font-semibold mb-2">Tags</h3>
							<div className="flex gap-2 flex-wrap">
								{product.tags.map(tag => (
									<Badge key={tag} variant="outline" className="text-xs">
										<Tag className="w-2 h-2 mr-1" />
										{tag}
									</Badge>
								))}
							</div>
						</div>
					)}

					<Separator />

					{/* Purchase Actions */}
					<div className="space-y-4">
						{/* Quantity Selector */}
						{!product.isDigital && (
							<div>
								<label className="block text-sm font-medium mb-2">Quantity</label>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
									>
										-
									</Button>
									<span className="w-12 text-center">{quantity}</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setQuantity(Math.min(
											product.stockQuantity || 999, 
											quantity + 1
										))}
									>
										+
									</Button>
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-4">
						
							<Button
								onClick={handleAddToCart}
								disabled={!canAddToCart()}
								className="flex-1"
								size="lg"
							>
								<ShoppingCart className="w-4 h-4 mr-2" />
								{!canAddToCart() ? 'Out of Stock' : 'Add to Cart'}
							</Button>
							<Button
								onClick={handleBuyNow}
								disabled={!canAddToCart()}
								variant="outline"
								className="flex-1"
								size="lg"
							>
								Buy Now
							</Button>
						</div>

						{/* Digital Product Info */}
						{product.isDigital && product.downloadUrl && (
							<div className="text-sm text-gray-500 text-center">
								Digital product - instant download after purchase
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetailPage;
