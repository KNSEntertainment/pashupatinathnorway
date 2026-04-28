import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function POST(request: Request) {
	try {
		await connectDB();

		const formData = await request.formData();
		
		// Extract basic fields
		const price = parseFloat(formData.get('price') as string);
		const currency = formData.get('currency') as string || 'NOK';
		const category = formData.get('category') as string;
		const type = formData.get('type') as string;
		const isActive = formData.get('isActive') === 'true';
		const inStock = formData.get('inStock') === 'true';
		const stockQuantity = parseInt(formData.get('stockQuantity') as string) || 0;
		const isDigital = formData.get('isDigital') === 'true';
		const downloadUrl = formData.get('downloadUrl') as string;
		const tags = formData.get('tags') as string;

		// Extract multi-language fields
		const name = {
			en: formData.get('name_en') as string || '',
			no: formData.get('name_no') as string || '',
			ne: formData.get('name_ne') as string || ''
		};

		const description = {
			en: formData.get('description_en') as string || '',
			no: formData.get('description_no') as string || '',
			ne: formData.get('description_ne') as string || ''
		};

		// Handle images
		let imageUrl = '';
		const images: string[] = [];
		
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

		// Parse features and specifications
		let features = [];
		try {
			features = JSON.parse(formData.get('features') as string);
		} catch {
			features = [];
		}

		let specifications = {};
		try {
			specifications = JSON.parse(formData.get('specifications') as string);
		} catch {
			specifications = {};
		}

		// Parse tags
		const tagArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

		// Create product
		const product = new Product({
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
			downloadUrl: isDigital ? downloadUrl : undefined,
			features,
			specifications,
			isActive,
			tags: tagArray
		});

		await product.save();

		return NextResponse.json({ 
			success: true, 
			product: JSON.parse(JSON.stringify(product)) 
		});

	} catch (error) {
		console.error('Error creating product:', error);
		return NextResponse.json({ 
			error: 'Failed to create product' 
		}, { status: 500 });
	}
}
