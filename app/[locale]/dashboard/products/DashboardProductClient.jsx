"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProductForm from "@/components/ProductForm";
import Image from "next/image";

export default function DashboardProductClient({ products }) {
	const [productList, setProductList] = useState(products);
	const [showForm, setShowForm] = useState(false);
	const [editingProduct, setEditingProduct] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterCategory, setFilterCategory] = useState("all");
	const [filterStatus, setFilterStatus] = useState("all");

	// Filter products
	const filteredProducts = productList.filter((product) => {
		const matchesSearch = !searchTerm || 
			product.name?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.name?.no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.name?.ne?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

		const matchesCategory = filterCategory === "all" || product.category === filterCategory;
		const matchesStatus = filterStatus === "all" || 
			(filterStatus === "active" && product.isActive) ||
			(filterStatus === "inactive" && !product.isActive);

		return matchesSearch && matchesCategory && matchesStatus;
	});

	const handleCreateProduct = () => {
		setEditingProduct(null);
		setShowForm(true);
	};

	const handleEditProduct = (product) => {
		setEditingProduct(product);
		setShowForm(true);
	};

	const handleCloseForm = () => {
		setShowForm(false);
		setEditingProduct(null);
	};

	const handleDeleteProduct = async (product) => {
		if (!confirm(`Are you sure you want to delete "${product.name?.en || product.name?.no || product.name?.ne || 'Unknown'}"?`)) {
			return;
		}

		try {
			const response = await fetch(`/api/products/${product._id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setProductList((prev) => prev.filter((p) => p._id !== product._id));
				alert("Product deleted successfully!");
			} else {
				const error = await response.json();
				alert(error.error || "Failed to delete product");
			}
		} catch (error) {
			console.error("Error deleting product:", error);
			alert("Failed to delete product");
		}
	};

	const handleToggleStatus = async (product) => {
		try {
			const response = await fetch(`/api/products/${product._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					isActive: !product.isActive,
				}),
			});

			if (response.ok) {
				setProductList((prev) =>
					prev.map((p) =>
						p._id === product._id ? { ...p, isActive: !p.isActive } : p
					)
				);
				alert(`Product ${product.isActive ? "deactivated" : "activated"} successfully!`);
			} else {
				const error = await response.json();
				alert(error.error || "Failed to update product status");
			}
		} catch (error) {
			console.error("Error updating product status:", error);
			alert("Failed to update product status");
		}
	};

	if (showForm) {
		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold">
							{editingProduct ? "Edit Product" : "Create Product"}
						</h2>
						<Button variant="outline" onClick={handleCloseForm}>
							×
						</Button>
					</div>
					<ProductForm
						handleCloseProductModal={handleCloseForm}
						productToEdit={editingProduct}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Products Management</h1>
				<Button onClick={handleCreateProduct}>Create Product</Button>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg shadow p-4 mb-6">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div>
						<Label htmlFor="search">Search</Label>
						<Input
							id="search"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Search products..."
						/>
					</div>
					<div>
						<Label htmlFor="category">Category</Label>
						<Select value={filterCategory} onValueChange={setFilterCategory}>
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
						<Label htmlFor="status">Status</Label>
						<Select value={filterStatus} onValueChange={setFilterStatus}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="active">Active</SelectItem>
								<SelectItem value="inactive">Inactive</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			{/* Products Grid */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-gray-50 border-b">
								<th className="px-4 py-3 text-left">Product</th>
								<th className="px-4 py-3 text-left">Category</th>
								<th className="px-4 py-3 text-left">Type</th>
								<th className="px-4 py-3 text-left">Price</th>
								<th className="px-4 py-3 text-left">Stock</th>
								<th className="px-4 py-3 text-left">Status</th>
								<th className="px-4 py-3 text-left">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredProducts.length === 0 ? (
								<tr>
									<td colSpan="7" className="px-4 py-8 text-center text-gray-500">
										No products found
									</td>
								</tr>
							) : (
								filteredProducts.map((product) => (
									<tr key={product._id} className="border-b hover:bg-gray-50">
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												{product.imageUrl && (
													<Image
														src={product.imageUrl}
														alt={product.name?.en || "Product"}
														className="w-12 h-12 rounded object-cover"
														width={48}
														height={48}
													/>
												)}
												<div>
													<div className="font-medium">
														{product.name?.en || product.name?.no || product.name?.ne || "Unknown"}
													</div>
													<div className="text-sm text-gray-500">
														{product.type}
													</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											<Badge variant={product.category === "product" ? "default" : "secondary"}>
												{product.category}
											</Badge>
										</td>
										<td className="px-4 py-3">{product.type}</td>
										<td className="px-4 py-3">NOK {product.price}</td>
										<td className="px-4 py-3">
											{product.isDigital ? (
												<Badge variant="outline">Digital</Badge>
											) : product.inStock ? (
												<span className="text-green-600">
													{product.stockQuantity || "In stock"}
												</span>
											) : (
												<span className="text-red-600">Out of stock</span>
											)}
										</td>
										<td className="px-4 py-3">
											<Badge variant={product.isActive ? "default" : "secondary"}>
												{product.isActive ? "Active" : "Inactive"}
											</Badge>
										</td>
										<td className="px-4 py-3">
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEditProduct(product)}
												>
													Edit
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleDeleteProduct(product)}
												>
													Delete
												</Button>
												<Button
													variant={product.isActive ? "secondary" : "default"}
													size="sm"
													onClick={() => handleToggleStatus(product)}
												>
													{product.isActive ? "Deactivate" : "Activate"}
												</Button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
