import { getProducts } from "@/lib/data/products";
import { normalizeDocs } from "@/lib/utils";
import DashboardProductClient from "./DashboardProductClient";

export default async function ProductsPage() {
	const productsRaw = await getProducts();
	const products = Array.isArray(productsRaw) ? productsRaw : [];
	const productsNorm = normalizeDocs(products);

	return <DashboardProductClient products={productsNorm} />;
}
