"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GripVertical, ArrowUpDown, Save, RefreshCw, Users, Crown } from "lucide-react";
import { toast } from "react-hot-toast";

interface ExecutiveMember {
	_id: string;
	firstName: string;
	lastName: string;
	position?: string;
	displayOrder: number;
	email: string;
	phone: string;
	membershipId: string;
}

export default function ExecutiveMemberReorder() {
	const [members, setMembers] = useState<ExecutiveMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [draggedItem, setDraggedItem] = useState<ExecutiveMember | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	useEffect(() => {
		fetchExecutiveMembers();
	}, []);

	const fetchExecutiveMembers = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/executive-members/reorder");

			if (!response.ok) {
				throw new Error("Failed to fetch executive members");
			}

			const data = await response.json();
			if (data.success) {
				setMembers(data.members);
			}
		} catch (error) {
			console.error("Error fetching executive members:", error);
			toast.error("Failed to load executive members");
		} finally {
			setLoading(false);
		}
	};

	const handleDragStart = (e: React.DragEvent, member: ExecutiveMember) => {
		setDraggedItem(member);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		setDragOverIndex(index);
	};

	const handleDragLeave = () => {
		setDragOverIndex(null);
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		setDragOverIndex(null);

		if (!draggedItem) return;

		const draggedIndex = members.findIndex((m) => m._id === draggedItem._id);
		if (draggedIndex === dropIndex) return;

		const newMembers = [...members];
		newMembers.splice(draggedIndex, 1);
		newMembers.splice(dropIndex, 0, draggedItem);

		// Update display orders
		const reorderedMembers = newMembers.map((member, index) => ({
			...member,
			displayOrder: index,
		}));

		setMembers(reorderedMembers);
		setDraggedItem(null);
	};

	const handleDragEnd = () => {
		setDraggedItem(null);
		setDragOverIndex(null);
	};

	const moveItem = (index: number, direction: "up" | "down") => {
		const newMembers = [...members];
		const targetIndex = direction === "up" ? index - 1 : index + 1;

		if (targetIndex < 0 || targetIndex >= newMembers.length) return;

		// Swap items
		[newMembers[index], newMembers[targetIndex]] = [newMembers[targetIndex], newMembers[index]];

		// Update display orders
		const reorderedMembers = newMembers.map((member, idx) => ({
			...member,
			displayOrder: idx,
		}));

		setMembers(reorderedMembers);
	};

	const saveOrder = async () => {
		try {
			setSaving(true);

			const memberOrders = members.map((member, index) => ({
				id: member._id,
				displayOrder: index,
			}));

			const response = await fetch("/api/executive-members/reorder", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ memberOrders }),
			});

			if (!response.ok) {
				throw new Error("Failed to save order");
			}

			const result = await response.json();
			if (result.success) {
				toast.success("Executive member order saved successfully!");
			} else {
				throw new Error(result.error || "Failed to save order");
			}
		} catch (error) {
			console.error("Error saving order:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save order");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand_primary"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
						<Crown className="w-5 h-5 text-brand_primary" />
						Executive Member Hierarchy
					</h3>
					<p className="text-sm text-gray-600 mt-1">Drag and drop to reorder executive members by hierarchy. Lower numbers appear first.</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={fetchExecutiveMembers} disabled={loading || saving}>
						<RefreshCw className="w-4 h-4 mr-2" />
						Reset
					</Button>
					<Button onClick={saveOrder} disabled={saving || loading} className="bg-brand_primary hover:bg-brand_primary/90 text-gray-700">
						<Save className="w-4 h-4 mr-2" />
						{saving ? "Saving..." : "Save Order"}
					</Button>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" />
						Executive Members ({members.length})
					</CardTitle>
				</CardHeader>
				<CardContent>
					{members.length === 0 ? (
						<div className="text-center py-8 text-gray-500">No executive members found.</div>
					) : (
						<div className="space-y-2">
							{members.map((member, index) => (
								<div
									key={member._id}
									draggable
									onDragStart={(e) => handleDragStart(e, member)}
									onDragOver={(e) => handleDragOver(e, index)}
									onDragLeave={handleDragLeave}
									onDrop={(e) => handleDrop(e, index)}
									onDragEnd={handleDragEnd}
									className={`
                    bg-white border rounded-lg p-4 cursor-move transition-all
                    hover:shadow-md hover:border-brand_primary/50
                    ${dragOverIndex === index ? "border-brand_primary bg-brand_primary/5" : "border-gray-200"}
                    ${draggedItem?._id === member._id ? "opacity-50" : ""}
                  `}
								>
									<div className="flex items-center gap-4">
										<div className="flex items-center gap-2">
											<GripVertical className="w-5 h-5 text-gray-400" />
											<div className="w-8 h-8 bg-brand_primary/10 rounded-full flex items-center justify-center text-brand_primary font-semibold text-sm">{index + 1}</div>
										</div>

										<div className="flex-1">
											<div className="flex items-center gap-3">
												<div>
													<h4 className="font-semibold text-gray-900">
														{member.firstName} {member.lastName}
													</h4>
													<p className="text-sm text-gray-600">{member.position || "Executive Member"}</p>
												</div>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<Button variant="ghost" size="sm" onClick={() => moveItem(index, "up")} disabled={index === 0} className="h-8 w-8 p-0">
												<ArrowUpDown className="w-4 h-4 rotate-180" />
											</Button>
											<Button variant="ghost" size="sm" onClick={() => moveItem(index, "down")} disabled={index === members.length - 1} className="h-8 w-8 p-0">
												<ArrowUpDown className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
