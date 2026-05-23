'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Product, StoreFilters } from '@/types';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UniversalLoader from '@/components/ui/UniversalLoader';
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
				
				<CardContent className="flex flex-col flex-1 p-2 md:p-4">
					<CardTitle className="text-sm md:text-lg line-clamp-2 mb-1 md:mb-2 group-hover:text-blue-600 transition-colors">
						{productName}
					</CardTitle>
					
					<div className="flex items-center justify-between mt-auto">
						<span className="text-xs md:text-lg font-bold text-green-700">
							NOK {product.price}
						</span>
						{!product.isDigital && product.inStock && product.stockQuantity !== undefined && product.stockQuantity > 0 && (
							<span className="hidden md:block text-xs text-gray-500">
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
	const [showMobileFilters, setShowMobileFilters] = useState(false);

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
	}, [pagination.page, filters.sortBy, filters.category, filters.type, filters.search, pagination.limit]);

	// Fetch products
	useEffect(() => {
		fetchProducts();
	}, [fetchProducts, pagination.limit]);

	// Handle filter changes
	const updateFilter = (key: keyof StoreFilters, value: string) => {
		setFilters(prev => ({ ...prev, [key]: value }));
		setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
	};

	// Remove individual filter
	const removeFilter = (key: keyof StoreFilters) => {
		setFilters(prev => ({ ...prev, [key]: key === 'search' ? '' : 'all' }));
		setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
		if (key === 'search') {
			setSearchInput(''); // Clear search input as well
		}
	};

	// Clear all filters
	const clearAllFilters = () => {
		setFilters({
			category: 'all',
			type: 'all',
			sortBy: 'date',
			search: ''
		});
		setSearchInput('');
		setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
	};

	// Check if any filters are applied
	const hasActiveFilters = filters.category !== 'all' || filters.type !== 'all' || filters.search !== '';


	return (
		<div className="container mx-auto px-4 py-12">
			<header className="text-center mb-6 md:mb-8">
				<SectionHeader heading={t('title')} subtitle={t('description')} />
			</header>
		

			{/* Search and Filter Bar */}
			<div className="mb-6 space-y-4">
				{/* Mobile Filter Button */}
				<div className="md:hidden flex justify-between items-center mb-4">
					<h2 className="text-lg font-semibold">{t('title')}</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowMobileFilters(true)}
						className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 border-blue-600 px-3 py-2 text-xs"
					>
						<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3.586a1 1 0 00-.293-.707L3.293 6.293A1 1 0 013 5.586V4z" />
							</svg>
						{t('filters')}
						{pagination.total > 0 && (
							<span className="bg-white text-blue-600 px-1.5 py-0.5 rounded-full text-xs font-semibold">
								{pagination.total}
							</span>
						)}
					</Button>
				</div>

				{/* Filters and Search - Desktop */}
				<div className="hidden md:block bg-slate-50 p-4 rounded-lg space-y-4 mb-4">
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
					{/* Filtered By Badges */}
				<div className="flex flex-wrap gap-2 mb-8">
					<span className="text-sm font-medium text-gray-600">{t('filteredBy')}</span>
					{filters.category !== 'all' && (
						<div className="relative inline-block">
							<Badge 
								variant="default" 
								className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors group pr-6"
								onClick={() => removeFilter('category')}
							>
								{filters.category === 'product' ? t('product') : t('service')}
							</Badge>
							<span 
								className="absolute top-0 right-0 -mt-1 -mr-1 text-red-500 group-hover:text-red-700 cursor-pointer bg-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none"
								onClick={() => removeFilter('category')}
							>
								×
							</span>
						</div>
					)}
					{filters.type !== 'all' && (
						<div className="relative inline-block">
							<Badge 
								variant="default" 
								className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors group pr-6"
								onClick={() => removeFilter('type')}
							>
								{t(`types.${filters.type}`) || filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
							</Badge>
							<span 
								className="absolute top-0 right-0 -mt-1 -mr-1 text-red-500 group-hover:text-red-700 cursor-pointer bg-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none"
								onClick={() => removeFilter('type')}
							>
								×
							</span>
						</div>
					)}
					{filters.search && (
						<div className="relative inline-block">
							<Badge 
								variant="default" 
								className="text-xs cursor-pointer hover:bg-red-100 hover:text-red-700 transition-colors group pr-6"
								onClick={() => removeFilter('search')}
							>
								{t('search')}: &quot;{filters.search}&quot;
							</Badge>
							<span 
								className="absolute top-0 right-0 -mt-1 -mr-1 text-red-500 group-hover:text-red-700 cursor-pointer bg-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none"
								onClick={() => removeFilter('search')}
							>
								×
							</span>
						</div>
					)}
					{hasActiveFilters && (
						<Button
							variant="outline"
							size="sm"
							onClick={clearAllFilters}
							className="text-xs h-6 px-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
						>
							{t('removeAllFilters')}
						</Button>
					)}
					{!hasActiveFilters && (
						<span className="text-xs text-gray-500 mt-0.5">{t('noFiltersApplied')}</span>
					)}
				</div>

				{/* Mobile Filter Overlay */}
				{showMobileFilters && (
					<div className="fixed inset-0 z-50 md:hidden">
						{/* Backdrop */}
					<div 
						className="absolute inset-0 bg-black bg-opacity-75"
						onClick={() => setShowMobileFilters(false)}
					/>
						
						{/* Filter Panel */}
						<div className="absolute inset-x-0 top-0 h-full bg-white shadow-lg">
							<div className="h-full overflow-y-auto">
								<div className="p-4">
									{/* Header */}
									<div className="flex justify-between items-center mb-6">
										<h3 className="text-lg font-semibold">{t('filters')}</h3>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setShowMobileFilters(false)}
											className="p-2 hover:bg-gray-100"
										>
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
										</Button>
									</div>

									{/* Filter Content */}
									<div className="space-y-6">
										{/* Category */}
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

										{/* Type */}
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

										{/* Search */}
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

										{/* Sort By */}
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
									</div>

									{/* Results Count */}
									<div className="mt-6 p-4 bg-gray-50 rounded-lg">
										<p className="text-center text-sm text-gray-600">
											{pagination.total > 0 ? (
												<>
													{t('showing')} {products.length} {t('of')} {pagination.total} {t('products')}
												</>
											) : (
												<>{t('noProductsFound')}</>
												)}
										</p>
									</div>

									{/* Apply Filters Button */}
									<div className="mt-6 space-y-3">
										<Button
											onClick={() => setShowMobileFilters(false)}
											className="w-full bg-blue-600 hover:bg-blue-700 text-white"
										>
											{t('applyFilters')}
										</Button>
										<Button
											variant="outline"
											onClick={clearAllFilters}
											className="w-full hover:bg-red-50 hover:border-red-200 hover:text-red-600"
										>
											{t('clearAllFilters')}
										</Button>
									</div>
								</div>
								</div>
							</div>
						</div>
					)}

			{/* Products Grid */}
			{loading ? (
				<div className="flex items-center justify-center min-h-[60vh]">
					<UniversalLoader size="lg" variant="dots" text="Loading products..." />
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
					
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-2 md:gap-6">
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
