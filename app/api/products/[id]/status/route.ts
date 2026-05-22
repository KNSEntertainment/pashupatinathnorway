import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product.Model";
import { requireAdmin } from "@/lib/apiAuth";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();
		const { id } = await params;
		const body = await request.json();
		const { isActive } = body;

		if (typeof isActive !== 'boolean') {
			return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 });
		}

		const product = await Product.findByIdAndUpdate(
			id,
			{ isActive },
			{ new: true, runValidators: true }
		);

		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		return NextResponse.json({ 
			success: true, 
			product: JSON.parse(JSON.stringify(product)),
			message: `Product ${isActive ? 'activated' : 'deactivated'} successfully`
		});

	} catch (error) {
		console.error('Error updating product status:', error);
		return NextResponse.json({ 
			error: 'Failed to update product status' 
		}, { status: 500 });
	}
}
