import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product.Model";

interface ProductQuery {
	isActive: boolean;
	category?: string;
	type?: string;
	$or?: Array<{
		'name.en'?: { $regex: string; $options: string };
		'name.no'?: { $regex: string; $options: string };
		'name.ne'?: { $regex: string; $options: string };
		'description.en'?: { $regex: string; $options: string };
		'description.no'?: { $regex: string; $options: string };
		'description.ne'?: { $regex: string; $options: string };
		tags?: { $in: RegExp[] };
	}>;
	price?: {
		$gte?: number;
		$lte?: number;
	};
	inStock?: boolean;
}

interface ProductSort {
	[key: string]: 1 | -1;
}

export async function GET(request: Request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const category = searchParams.get('category');
		const type = searchParams.get('type');
		const search = searchParams.get('search');
		const sortBy = searchParams.get('sortBy') || 'date';
		const minPrice = searchParams.get('minPrice');
		const maxPrice = searchParams.get('maxPrice');
		const inStockOnly = searchParams.get('inStockOnly') === 'true';
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');

		// Build query
		const query: ProductQuery = { isActive: true };

		if (category && category !== 'all') {
			query.category = category;
		}

		if (type) {
			query.type = type;
		}

		if (search) {
			query.$or = [
				{ 'name.en': { $regex: search, $options: 'i' } },
				{ 'name.no': { $regex: search, $options: 'i' } },
				{ 'name.ne': { $regex: search, $options: 'i' } },
				{ 'description.en': { $regex: search, $options: 'i' } },
				{ 'description.no': { $regex: search, $options: 'i' } },
				{ 'description.ne': { $regex: search, $options: 'i' } },
				{ tags: { $in: [new RegExp(search, 'i')] } }
			];
		}

		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = parseFloat(minPrice);
			if (maxPrice) query.price.$lte = parseFloat(maxPrice);
		}

		if (inStockOnly) {
			query.inStock = true;
		}

		// Build sort
		let sort: ProductSort = {};
		switch (sortBy) {
			case 'price-asc':
				sort = { price: 1 };
				break;
			case 'price-desc':
				sort = { price: -1 };
				break;
			case 'name-asc':
				sort = { 'name.en': 1 };
				break;
			case 'name-desc':
				sort = { 'name.en': -1 };
				break;
			case 'date':
			default:
				sort = { createdAt: -1 };
				break;
		}

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const products = await Product.find(query)
			.sort(sort)
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await Product.countDocuments(query);

		// Get unique types for filtering
		const types = await Product.distinct('type', { isActive: true });

		return NextResponse.json({
			products,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit)
			},
			filters: {
				types
			}
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		await connectDB();

		const body = await request.json();
		const product = await Product.create(body);

		return NextResponse.json(product, { status: 201 });
	} catch (error) {
		console.error("Error creating product:", error);
		return NextResponse.json(
			{ error: "Failed to create product" },
			{ status: 500 }
		);
	}
}
