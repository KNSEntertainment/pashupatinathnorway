'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Product, StoreFilters } from '@/types';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import SectionHeader from '@/components/SectionHeader';

interface StorePageProps {
	params: Promise<{ locale: string }>;
}


const StorePage: React.FC<StorePageProps> = () => {
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations('store');

	// ProductCard component inside StorePage to access translations
	interface ProductCardProps {
		product: Product;
		locale: string;
		router: ReturnType<typeof useRouter>;
	}

	const ProductCard: React.FC<ProductCardProps> = ({ product, locale, router }) => {
		const productName = product.name[locale as keyof typeof product.name] || product.name.en;

		const handleProductClick = () => {
			router.push(`/${locale}/store/${product._id}`);
		};

		return (
			<Card 
				className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
				onClick={handleProductClick}
			>
				<CardHeader className="p-0">
					<div className="relative aspect-square overflow-hidden bg-gray-100">
						<Image
							src={product.imageUrl}
							alt={productName || 'Product image'}
							width={400}
							height={400}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
						/>
						{!product.inStock && !product.isDigital && (
							<div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
								<Badge variant="destructive" className="text-sm">
									{t('outOfStock')}
								</Badge>
							</div>
						)}
						{product.isDigital && (
							<div className="absolute top-2 right-2">
								<Badge variant="secondary" className="bg-brand_primary text-gray-700 text-xs">
									{t('digital')}
								</Badge>
							</div>
						)}
						{/* Overlay on hover */}
						<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
							<span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
								{t('viewDetails')}
							</span>
						</div>
					</div>
				</CardHeader>
				
				<CardContent className="flex flex-col flex-1 p-4">
					<CardTitle className="text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
						{productName}
					</CardTitle>
					
					<div className="flex items-center justify-between mt-auto">
						<span className="text-xl font-bold text-green-700">
							NOK {product.price}
						</span>
						{!product.isDigital && product.stockQuantity !== undefined && product.stockQuantity > 0 && (
							<span className="text-xs text-gray-500">
								{product.stockQuantity} {t('left')}
							</span>
						)}
					</div>
				</CardContent>
			</Card>
		);
	};
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [productTypes, setProductTypes] = useState<string[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 20,
		total: 0,
		pages: 0
	});

	const [filters, setFilters] = useState<StoreFilters>({
		category: 'all',
		type: 'all',
		sortBy: 'date',
		search: ''
	});

	const [searchInput, setSearchInput] = useState('');

	// Debounced search effect
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchInput !== filters.search) {
				setFilters(prev => ({ ...prev, search: searchInput }));
			}
		}, 500); // 500ms delay

		return () => clearTimeout(timer);
	}, [searchInput, filters.search]);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({
				page: pagination.page.toString(),
				limit: pagination.limit.toString(),
				sortBy: filters.sortBy,
				...(filters.category !== 'all' && { category: filters.category }),
				...(filters.type !== 'all' && { type: filters.type }),
				...(filters.search && { search: filters.search })
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
	}, [pagination.page, filters.sortBy, filters.category, filters.type, filters.search]);

	// Fetch products
	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	// Handle filter changes
	const updateFilter = (key: keyof StoreFilters, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value }));
		setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
	};


	return (
		<div className="container mx-auto px-4 py-12">
			<header className="text-center mb-6 md:mb-8">
				<SectionHeader heading={t('title')} subtitle={t('description')} />
			</header>
		

			{/* Search and Filter Bar */}
			<div className="mb-6 space-y-4">
				{/* Filtered By Badges */}
				<div className="flex flex-wrap gap-2 mb-4">
					<span className="text-sm font-medium text-gray-600">{t('filteredBy')}</span>
					{filters.category !== 'all' && (
						<Badge variant="secondary" className="text-xs">
							{filters.category === 'product' ? t('product') : t('service')}
						</Badge>
					)}
					{filters.type !== 'all' && (
						<Badge variant="secondary" className="text-xs">
							{t(`types.${filters.type}`) || filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
						</Badge>
					)}
					{filters.search && (
						<Badge variant="secondary" className="text-xs">
							{t('search')}: &quot;{filters.search}&quot;
						</Badge>
					)}
					{filters.category === 'all' && filters.type === 'all' && !filters.search && (
						<span className="text-xs text-gray-500 mt-0.5">{t('noFiltersApplied')}</span>
					)}
				</div>

				{/* Filters and Search */}
				<div className="bg-brand_secondary/10 p-4 rounded-lg space-y-4 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<div>
							<label className="block text-sm font-medium mb-2">{t('category')}</label>
							<Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t('allCategories')}</SelectItem>
									<SelectItem value="product">{t('product')}</SelectItem>
									<SelectItem value="service">{t('service')}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">{t('type')}</label>
							<Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
								<SelectTrigger>
									<SelectValue placeholder={t('allTypes')} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">{t('allTypes')}</SelectItem>
									{productTypes.map(type => (
										<SelectItem key={type} value={type}>
											{t(`types.${type}`) || type.charAt(0).toUpperCase() + type.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">{t('sortBy')}</label>
							<Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="date">{t('latestFirst')}</SelectItem>
									<SelectItem value="price-asc">{t('priceLowHigh')}</SelectItem>
									<SelectItem value="price-desc">{t('priceHighLow')}</SelectItem>
									<SelectItem value="name-asc">{t('nameAZ')}</SelectItem>
									<SelectItem value="name-desc">{t('nameZA')}</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<label className="block text-sm font-medium mb-2">{t('search')}</label>
							<div className="relative">
								<Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
								<Input
									placeholder={t('searchPlaceholder')}
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
					</div>
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
					<div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
						<span className="text-gray-400 text-2xl">📦</span>
					</div>
					<h3 className="text-xl font-semibold mb-2">{t('noProductsFound')}</h3>
					<p className="text-gray-600">{t('tryAdjustingFilters')}</p>
				</div>
			) : (
				<>
					<div className="mb-4 text-sm text-gray-600">
						{t('showing')} {products.length} {t('of')} {pagination.total} {t('products')}
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{products.map(product => (
							<ProductCard 
								key={product._id} 
								product={product} 
								locale={locale}
								router={router}
							/>
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
								{t('previous')}
							</Button>
							
							<span className="text-sm text-gray-600">
								{t('page')} {pagination.page} {t('ofPages')} {pagination.pages}
							</span>
							
							<Button
								variant="outline"
								onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
								disabled={pagination.page === pagination.pages}
							>
								{t('next')}
							</Button>
						</div>
					)}
				</>
			)}
			</div>
		</div>
	);
};

export default StorePage;
