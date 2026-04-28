import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

export default function DepartmentForm({ handleCloseModal, departmentToEdit = null }) {
	const [formData, setFormData] = useState({
		name: "",
		subdepartments: [],
		order: 0,
		isActive: true,
	});
	const [subdepartmentInput, setSubdepartmentInput] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (departmentToEdit) {
			setFormData({
				name: departmentToEdit.name || "",
				subdepartments: departmentToEdit.subdepartments || [],
				order: departmentToEdit.order || 0,
				isActive: departmentToEdit.isActive !== undefined ? departmentToEdit.isActive : true,
			});
		}
	}, [departmentToEdit]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleAddSubdepartment = () => {
		if (subdepartmentInput.trim()) {
			setFormData((prev) => ({
				...prev,
				subdepartments: [...prev.subdepartments, subdepartmentInput.trim()],
			}));
			setSubdepartmentInput("");
		}
	};

	const handleRemoveSubdepartment = (index) => {
		setFormData((prev) => ({
			...prev,
			subdepartments: prev.subdepartments.filter((_, i) => i !== index),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const url = departmentToEdit ? `/api/departments/${departmentToEdit._id}` : "/api/departments/create";
			const method = departmentToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${departmentToEdit ? "update" : "create"} department`);
			}

			if (result.success) {
				setFormData({
					name: "",
					subdepartments: [],
					order: 0,
					isActive: true,
				});
				handleCloseModal();
				window.location.reload();
			}
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="p-3 bg-red-50 border border-red-6000 text-red-600 rounded">{error}</div>}

			<div>
				<label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-1">
					Department Name *
				</label>
				<input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand" />
			</div>

			<div>
				<label className="block text-sm font-medium text-gray-900 mb-2">Subdepartments</label>
				<div className="flex gap-2 mb-2">
					<input
						type="text"
						value={subdepartmentInput}
						onChange={(e) => setSubdepartmentInput(e.target.value)}
						onKeyPress={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleAddSubdepartment();
							}
						}}
						placeholder="Enter subdepartment name"
						className="flex-1 px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
					/>
					<Button type="button" onClick={handleAddSubdepartment} className="bg-brand_primary hover:bg-brand_primary/90">
						<Plus className="w-4 h-4" />
					</Button>
				</div>
				<div className="space-y-2">
					{formData.subdepartments.map((subdept, index) => (
						<div key={index} className="flex items-center justify-between bg-light p-2 rounded">
							<span className="text-sm">{subdept}</span>
							<button type="button" onClick={() => handleRemoveSubdepartment(index)} className="text-red-500 hover:text-red-600">
								<X className="w-4 h-4" />
							</button>
						</div>
					))}
				</div>
			</div>

			<div>
				<label htmlFor="order" className="block text-sm font-medium text-gray-900 mb-1">
					Display Order
				</label>
				<input type="number" id="order" name="order" value={formData.order} onChange={handleChange} className="w-full px-3 py-2 border border-light rounded-md focus:outline-none focus:ring-2 focus:ring-brand" />
			</div>

			<div className="flex items-center">
				<input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4 text-brand_primary border-light rounded focus:ring-brand" />
				<label htmlFor="isActive" className="ml-2 text-sm text-gray-900">
					Active
				</label>
			</div>

			<div className="flex justify-end gap-3 pt-4">
				<Button type="button" onClick={handleCloseModal} variant="outline">
					Cancel
				</Button>
				<Button type="submit" disabled={submitting} className="bg-brand_primary hover:bg-brand_primary/90">
					{submitting ? "Saving..." : departmentToEdit ? "Update Department" : "Create Department"}
				</Button>
			</div>
		</form>
	);
}
