'use client';

import React, { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Product, StoreFilters } from '@/types';
import { useCart } from '@/context/CartContext';
import { Search, Filter, ShoppingCart, Star, Package, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface StorePageProps {
	params: Promise<{ locale: string }>;
}

interface ResolvedParams {
	locale: string;
}

const StorePage: React.FC<StorePageProps> = ({ params }) => {
	const resolvedParams = use(params) as ResolvedParams;
	const t = useTranslations('store');
	const { addToCart } = useCart();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [showFilters, setShowFilters] = useState(false);
	const [productTypes, setProductTypes] = useState<string[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		pages: 0
	});

	const [filters, setFilters] = useState<StoreFilters>({
		category: 'all',
		type: '',
		priceRange: [0, 10000],
		sortBy: 'date',
		search: '',
		inStockOnly: false
	});

	// Fetch products
	useEffect(() => {
		fetchProducts();
	}, [pagination.page, filters]);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				sortBy: filters.sortBy,
				...(filters.category !== 'all' && { category: filters.category }),
				...(filters.type && { type: filters.type }),
				...(filters.search && { search: filters.search }),
				...(filters.priceRange[0] > 0 && { minPrice: filters.priceRange[0].toString() }),
				...(filters.priceRange[1] < 10000 && { maxPrice: filters.priceRange[1].toString() }),
				...(filters.inStockOnly && { inStockOnly: 'true' })
			});

			const response = await fetch(`/api/products?${params}`);
			const data = await response.json();

			if (response.ok) {
				setProducts(data.products);
				setPagination(data.pagination);
				setProductTypes(data.filters.types);
			} else {
				toast.error('Failed to load products');
			}
		} catch (error) {
			console.error('Error fetching products:', error);
			toast.error('Failed to load products');
		} finally {
			setLoading(false);
		}
	};

	// Handle filter changes
	const updateFilter = (key: keyof StoreFilters, value: string | boolean | number[]) => {
		setFilters(prev => ({ ...prev, [key]: value }));
		setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
	};

	const handleAddToCart = (product: Product) => {
		addToCart(product, 1);
		toast.success(`${product.name[resolvedParams.locale as keyof typeof product.name] || product.name.en} added to cart`);
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat(resolvedParams.locale === 'no' ? 'nb-NO' : 'en-US', {
			style: 'currency',
			currency: 'NOK'
		}).format(price);
	};

	const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
		const productName = product.name[resolvedParams.locale as keyof typeof product.name] || product.name.en;
		const productDescription = product.description[resolvedParams.locale as keyof typeof product.description] || product.description.en;

		return (
			<Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
				<CardHeader className="p-0">
					<div className="relative aspect-square overflow-hidden bg-gray-100">
						<Image
							src={product.imageUrl}
							alt={productName || 'Product image'}
							width={400}
							height={400}
							className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
						/>
						{!product.inStock && !product.isDigital && (
							<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
								<Badge variant="destructive" className="text-sm">
									Out of Stock
								</Badge>
							</div>
						)}
						{product.isDigital && (
							<div className="absolute top-2 right-2">
								<Badge variant="secondary" className="text-xs">
									Digital
								</Badge>
							</div>
						)}
					</div>
				</CardHeader>
				
				<CardContent className="flex-1 p-4">
					<div className="space-y-2">
						<div className="flex items-start justify-between">
							<CardTitle className="text-lg line-clamp-2">{productName}</CardTitle>
							<Badge variant="outline" className="text-xs">
								{product.type}
							</Badge>
						</div>
						
						<p className="text-sm text-gray-600 line-clamp-3">
							{productDescription}
						</p>
						
						<div className="flex items-center gap-2">
							<Badge variant={product.category === 'product' ? 'default' : 'secondary'}>
								{product.category === 'product' ? (
									<><Package className="w-3 h-3 mr-1" /> Product</>
								) : (
									<><Calendar className="w-3 h-3 mr-1" /> Service</>
								)}
							</Badge>
							{product.tags && product.tags.length > 0 && (
								<div className="flex gap-1 flex-wrap">
									{product.tags.slice(0, 2).map(tag => (
										<Badge key={tag} variant="outline" className="text-xs">
											<Tag className="w-2 h-2 mr-1" />
											{tag}
										</Badge>
									))}
								</div>
							)}
						</div>
						
						{product.features && product.features.length > 0 && (
							<div className="space-y-1">
								{product.features.slice(0, 2).map((feature, index) => (
									<div key={index} className="text-xs text-gray-500 flex items-center gap-1">
										<Star className="w-3 h-3 text-yellow-500" />
										{feature[resolvedParams.locale as keyof typeof feature] || feature.en}
									</div>
								))}
							</div>
						)}
					</div>
				</CardContent>
				
				<CardFooter className="p-4 pt-0 space-y-3">
					<div className="flex items-center justify-between w-full">
						<span className="text-2xl font-bold text-green-600">
							{formatPrice(product.price)}
						</span>
						{!product.isDigital && product.stockQuantity !== undefined && (
							<span className="text-sm text-gray-500">
								{product.stockQuantity} left
							</span>
						)}
					</div>
					
					<Button 
						onClick={() => handleAddToCart(product)}
						disabled={!product.inStock && !product.isDigital}
						className="w-full"
					>
						<ShoppingCart className="w-4 h-4 mr-2" />
						{(!product.inStock && !product.isDigital) ? 'Out of Stock' : 'Add to Cart'}
					</Button>
				</CardFooter>
			</Card>
		);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
				<p className="text-gray-600">{t('description')}</p>
			</div>

			{/* Search and Filter Bar */}
			<div className="mb-6 space-y-4">
				<div className="flex flex-col md:flex-row gap-4">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<Input
							placeholder={t('searchPlaceholder')}
							value={filters.search}
							onChange={(e) => updateFilter('search', e.target.value)}
							className="pl-10"
						/>
					</div>
					
					<Button
						variant="outline"
						onClick={() => setShowFilters(!showFilters)}
						className="flex items-center gap-2"
					>
						<Filter className="w-4 h-4" />
						Filters
						{(filters.category !== 'all' || filters.type || filters.inStockOnly) && (
							<Badge variant="secondary" className="ml-1">
								Active
							</Badge>
						)}
					</Button>
				</div>

				{/* Filters */}
				{showFilters && (
					<div className="bg-gray-50 p-4 rounded-lg space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div>
								<label className="block text-sm font-medium mb-2">Category</label>
								<Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										<SelectItem value="product">Products</SelectItem>
										<SelectItem value="service">Services</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Type</label>
								<Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
									<SelectTrigger>
										<SelectValue placeholder="All Types" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">All Types</SelectItem>
										{productTypes.map(type => (
											<SelectItem key={type} value={type}>
												{type.charAt(0).toUpperCase() + type.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">Sort By</label>
								<Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="date">Latest First</SelectItem>
										<SelectItem value="price-asc">Price: Low to High</SelectItem>
										<SelectItem value="price-desc">Price: High to Low</SelectItem>
										<SelectItem value="name-asc">Name: A to Z</SelectItem>
										<SelectItem value="name-desc">Name: Z to A</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="inStock"
									checked={filters.inStockOnly}
									onChange={(e) => updateFilter('inStockOnly', e.target.checked)}
									className="rounded"
								/>
								<label htmlFor="inStock" className="text-sm font-medium">
									In Stock Only
								</label>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">
								Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
							</label>
							<Slider
								value={filters.priceRange}
								onValueChange={(value) => updateFilter('priceRange', value)}
								max={10000}
								min={0}
								step={50}
								className="w-full"
							/>
						</div>
					</div>
				)}
			</div>

			{/* Products Grid */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="animate-pulse">
							<div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
							<div className="space-y-2">
								<div className="h-4 bg-gray-200 rounded"></div>
								<div className="h-4 bg-gray-200 rounded w-3/4"></div>
								<div className="h-8 bg-gray-200 rounded"></div>
							</div>
						</div>
					))}
				</div>
			) : products.length === 0 ? (
				<div className="text-center py-12">
					<Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
					<h3 className="text-xl font-semibold mb-2">No products found</h3>
					<p className="text-gray-600">Try adjusting your filters or search terms</p>
				</div>
			) : (
				<>
					<div className="mb-4 text-sm text-gray-600">
						Showing {products.length} of {pagination.total} products
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.map(product => (
							<ProductCard key={product._id} product={product} />
						))}
					</div>

					{/* Pagination */}
					{pagination.pages > 1 && (
						<div className="flex justify-center items-center gap-2 mt-8">
							<Button
								variant="outline"
								onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
								disabled={pagination.page === 1}
							>
								Previous
							</Button>
							
							<span className="text-sm text-gray-600">
								Page {pagination.page} of {pagination.pages}
							</span>
							
							<Button
								variant="outline"
								onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
								disabled={pagination.page === pagination.pages}
							>
								Next
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default StorePage;
