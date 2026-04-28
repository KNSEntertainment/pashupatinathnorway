"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import DepartmentForm from "@/components/DepartmentForm";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Department {
	_id: string;
	name: string;
	subdepartments: string[];
	order: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

function SortableDepartmentCard({ department, onEdit, onDelete }: { department: Department; onEdit: (dept: Department) => void; onDelete: (id: string) => void }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: department._id,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start mb-4">
				<div className="flex items-start gap-3 flex-1">
					<button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1 text-gray-900 hover:text-gray-900">
						<GripVertical className="w-5 h-5" />
					</button>
					<div>
						<h2 className="text-xl font-semibold text-gray-900">{department.name}</h2>
						<p className="text-sm text-gray-900 mt-1">Order: {department.order}</p>
					</div>
				</div>
				<div className="flex gap-2">
					<button onClick={() => onEdit(department)} className="p-2 text-brand hover:bg-brand/10 rounded">
						<Edit className="w-4 h-4" />
					</button>
					<button onClick={() => onDelete(department._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
						<Trash2 className="w-4 h-4" />
					</button>
				</div>
			</div>

			{department.subdepartments && department.subdepartments.length > 0 && (
				<div className="mt-4">
					<p className="text-sm font-medium text-gray-900 mb-2">Subdepartments:</p>
					<div className="flex flex-wrap gap-2">
						{department.subdepartments.map((subdept, index) => (
							<span key={index} className="px-3 py-1 bg-brand/10 text-brand text-sm rounded-full">
								{subdept}
							</span>
						))}
					</div>
				</div>
			)}

			<div className="mt-4 pt-4 border-t border-light">
				<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${department.isActive ? "bg-success text-white" : "bg-light text-gray-900"}`}>{department.isActive ? "Active" : "Inactive"}</span>
			</div>
		</div>
	);
}

export default function DepartmentsPage() {
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		fetchDepartments();
	}, []);

	const fetchDepartments = async () => {
		try {
			const response = await fetch("/api/departments");
			const data = await response.json();
			if (data.success) {
				setDepartments(data.departments);
			}
		} catch (error) {
			console.error("Error fetching departments:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (department: Department) => {
		setEditingDepartment(department);
		setShowModal(!showModal);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this department?")) return;

		try {
			const response = await fetch(`/api/departments/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				fetchDepartments();
			}
		} catch (error) {
			console.error("Error deleting department:", error);
		}
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingDepartment(null);
		fetchDepartments();
	};

	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		setDepartments((items) => {
			const oldIndex = items.findIndex((item) => item._id === active.id);
			const newIndex = items.findIndex((item) => item._id === over.id);

			const newOrder = arrayMove(items, oldIndex, newIndex);

			// Update order in backend
			updateDepartmentOrder(newOrder);

			return newOrder;
		});
	};

	const updateDepartmentOrder = async (orderedDepartments: Department[]) => {
		try {
			await fetch("/api/departments/reorder", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ departments: orderedDepartments }),
			});
		} catch (error) {
			console.error("Error updating department order:", error);
		}
	};

	if (loading) {
		return <div className="p-6">Loading...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Manage Departments</h1>
				<Button
					onClick={() => {
						setEditingDepartment(null);
						setShowModal(!showModal);
					}}
					className="bg-brand hover:bg-brand/90"
				>
					{showModal ? (
						"Cancel"
					) : (
						<>
							<Plus className="w-4 h-4 mr-2" /> Add Department
						</>
					)}
				</Button>
			</div>

			{/* Inline Form Section */}
			{showModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">{editingDepartment ? "Edit Department" : "Add New Department"}</h2>
					<DepartmentForm handleCloseModal={handleCloseModal} departmentToEdit={editingDepartment as unknown as null} />
				</div>
			)}

			{departments.length === 0 ? (
				<div className="text-center py-12 bg-light rounded-lg">
					<p className="text-gray-900">No departments found. Create your first department!</p>
				</div>
			) : (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={departments.map((d) => d._id)} strategy={verticalListSortingStrategy}>
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{departments.map((department) => (
								<SortableDepartmentCard key={department._id} department={department} onEdit={handleEdit} onDelete={handleDelete} />
							))}
						</div>
					</SortableContext>
				</DndContext>
			)}
		</div>
	);
}
