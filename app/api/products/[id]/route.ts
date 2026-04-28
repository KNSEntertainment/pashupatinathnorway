import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
	try {
		await connectDB();
		const { id } = await params;

		const product = await Product.findById(id);
		if (!product) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		return NextResponse.json({ 
			success: true, 
			product: JSON.parse(JSON.stringify(product)) 
		});

	} catch (error) {
		console.error('Error fetching product:', error);
		return NextResponse.json({ 
			error: 'Failed to fetch product' 
		}, { status: 500 });
	}
}

export async function PUT(request: Request, { params }: RouteParams) {
	try {
		await connectDB();
		const { id } = await params;

		const formData = await request.formData();
		
		// Find existing product
		const existingProduct = await Product.findById(id);
		if (!existingProduct) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		// Extract basic fields
		const price = parseFloat(formData.get('price') as string);
		const currency = formData.get('currency') as string || 'NOK';
		const category = formData.get('category') as string || existingProduct.category;
		const type = formData.get('type') as string || existingProduct.type;
		const isActive = formData.get('isActive') === 'true';
		const inStock = formData.get('inStock') === 'true';
		const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0;
		const isDigital = formData.get('isDigital') === 'true';
		const downloadUrl = formData.get('downloadUrl') as string;
		const tags = formData.get('tags') as string;

		// Extract multi-language fields
		const name = {
			en: formData.get('name_en') as string || existingProduct.name.en,
			no: formData.get('name_no') as string || existingProduct.name.no,
			ne: formData.get('name_ne') as string || existingProduct.name.ne
		};

		const description = {
			en: formData.get('description_en') as string || existingProduct.description.en,
			no: formData.get('description_no') as string || existingProduct.description.no,
			ne: formData.get('description_ne') as string || existingProduct.description.ne
		};

		// Handle images
		let imageUrl = existingProduct.imageUrl;
		const images: string[] = [...existingProduct.images];
		
		// Main image
		const imageFile = formData.get('imageUrl') as File;
		if (imageFile && imageFile.size > 0) {
			try {
				imageUrl = await uploadToCloudinary(imageFile);
			} catch (error) {
				console.error('Error uploading main image:', error);
				return NextResponse.json({ error: 'Failed to upload main image' }, { status: 500 });
			}
		}

		// Additional images
		const imageFiles = formData.getAll('images') as File[];
		for (const file of imageFiles) {
			if (file && file.size > 0) {
				try {
					const uploadedUrl = await uploadToCloudinary(file);
					images.push(uploadedUrl);
				} catch (error) {
					console.error('Error uploading additional image:', error);
				}
			}
		}

		// Handle image removal
		const removeImages = formData.getAll('removeImages') as string[];
		for (const index of removeImages) {
			const idx = parseInt(index);
			if (!isNaN(idx) && idx >= 0 && idx < images.length) {
				images.splice(idx, 1);
			}
		}

		// Parse features and specifications
		let features = existingProduct.features;
		try {
			const newFeatures = JSON.parse(formData.get('features') as string);
			if (Array.isArray(newFeatures)) {
				features = newFeatures;
			}
		} catch {
			// Keep existing features if parsing fails
		}

		let specifications = existingProduct.specifications;
		try {
			const newSpecs = JSON.parse(formData.get('specifications') as string);
			if (typeof newSpecs === 'object' && newSpecs !== null) {
				specifications = newSpecs;
			}
		} catch {
			// Keep existing specifications if parsing fails
		}

		// Parse tags
		const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : existingProduct.tags;

		// Update product
		const updateData = {
			name,
			description,
			price,
			currency,
			category,
			type,
			imageUrl,
			images,
			inStock,
			stockQuantity: inStock ? stockQuantity : undefined,
			isDigital,
			downloadUrl: isDigital ? downloadUrl : existingProduct.downloadUrl,
			features,
			specifications,
			isActive,
			tags: tagArray
		};

		const updatedProduct = await Product.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		);

		if (!updatedProduct) {
			return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
		}

		return NextResponse.json({ 
			success: true, 
			product: JSON.parse(JSON.stringify(updatedProduct)) 
		});

	} catch (error) {
		console.error('Error updating product:', error);
		return NextResponse.json({ 
			error: 'Failed to update product' 
		}, { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: RouteParams) {
	try {
		await connectDB();
		const { id } = await params;

		const deletedProduct = await Product.findByIdAndDelete(id);
		if (!deletedProduct) {
			return NextResponse.json({ error: 'Product not found' }, { status: 404 });
		}

		return NextResponse.json({ 
			success: true, 
			message: 'Product deleted successfully' 
		});

	} catch (error) {
		console.error('Error deleting product:', error);
		return NextResponse.json({ 
			error: 'Failed to delete product' 
		}, { status: 500 });
	}
}
