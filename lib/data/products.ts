import connectDB from "@/lib/mongodb";
import Product from "@/models/Product.Model";

export async function getProducts() {
	await connectDB();
	return Product.find().lean();
}
