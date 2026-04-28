"use client";

import React, { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, CheckCircle, XCircle, Clock, User, Mail, Phone, Calendar, MapPin, Briefcase, Award, Heart, X, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Membership } from "@/types";

export default function MembershipsPage() {
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [bulkStatus, setBulkStatus] = useState("");
	const [viewingMember, setViewingMember] = useState<Membership | null>(null);
	const [editingMember, setEditingMember] = useState<Membership | null>(null);
	const [editFormData, setEditFormData] = useState<Partial<Membership>>({});
	const MEMBERS_PER_PAGE = 10;
	const { data: memberships, error, loading, mutate } = useFetchData("/api/membership", "memberships");
	const { toast } = useToast();

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this membership?")) {
			try {
				const response = await fetch(`/api/membership/${id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to delete membership");
				}
				toast({
					title: "Success",
					description: "Membership deleted successfully",
				});
				mutate();
			} catch (error) {
				console.error("Error deleting membership:", error);
				toast({
					title: "Error",
					description: "Failed to delete membership. Please try again.",
					variant: "destructive",
				});
			}
		}
	};

	const handleStatusUpdate = async (id: string, newStatus: string) => {
		try {
			const response = await fetch(`/api/membership/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ membershipStatus: newStatus }),
			});
			if (!response.ok) {
				throw new Error("Failed to update status");
			}

			toast({
				title: "Success",
				description: newStatus === "approved" ? "Membership approved and welcome email sent successfully" : `Membership ${newStatus} successfully`,
			});
			
			mutate();
		} catch (error) {
			console.error("Error updating status:", error);
			toast({
				title: "Error",
				description: "Failed to update status. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleEdit = (member: Membership) => {
		setEditingMember(member);
		setEditFormData({
			fullName: member.fullName,
			email: member.email,
			phone: member.phone,
			address: member.address,
			city: member.city,
			postalCode: member.postalCode,
			dateOfBirth: member.dateOfBirth,
			gender: member.gender,
			province: member.province,
			district: member.district,
			profession: member.profession,
			membershipType: member.membershipType,
			membershipStatus: member.membershipStatus,
			skills: member.skills,
			volunteerInterest: member.volunteerInterest || [],
			permissionPhotos: member.permissionPhotos,
			permissionPhone: member.permissionPhone,
			permissionEmail: member.permissionEmail,
		});
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingMember) return;

		try {
			const response = await fetch(`/api/membership/${editingMember._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editFormData),
			});

			if (!response.ok) {
				throw new Error("Failed to update membership");
			}

			toast({
				title: "Success",
				description: "Membership updated successfully",
			});
			setEditingMember(null);
			setEditFormData({});
			mutate();
		} catch (error) {
			console.error("Error updating membership:", error);
			toast({
				title: "Error",
				description: "Failed to update membership. Please try again.",
				variant: "destructive",
			});
		}
	};

	const handleEditChange = (field: string, value: string | boolean) => {
		setEditFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handlePasswordReset = async () => {
		const firstSelectedId = selectedMemberIds[0];
		if (firstSelectedId) {
			// Find the member's name from the paginated data
			let selectedMember: Membership | undefined;
			for (const member of paginatedMemberships) {
				if ((member as Membership)._id === firstSelectedId) {
					selectedMember = member as Membership;
					break;
				}
			}
			const memberName = selectedMember?.fullName || 'Member';
			const memberEmail = selectedMember?.email;
			
			// Validate that we have a valid email
			if (!memberEmail) {
				toast({
					title: "Error",
					description: "Selected member does not have a valid email address.",
					variant: "destructive",
				});
				return;
			}
			
			// Send password reset email directly without prompting for password
			try {
				const response = await fetch('/api/email/password-reset', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: memberEmail,
						name: memberName,
						temporaryPassword: '', // API generates its own password but expects this field
					}),
				});

				if (response.ok) {
					toast({
						title: "Password Reset Email Sent",
						description: `Password reset email sent to ${memberName}.`,
					});
				} else {
					const errorData = await response.json();
					console.error('API Error Response:', errorData);
					throw new Error(errorData.error || 'Failed to send password reset email');
				}
			} catch (error) {
				console.error('Password reset error:', error);
				toast({
					title: "Error",
					description: error instanceof Error ? error.message : "Failed to send password reset email. Please try again.",
					variant: "destructive",
				});
			}
		}
	};

	const filteredMemberships =
		memberships?.filter((member: Membership) => {
			const matchesSearch = member.fullName?.toLowerCase().includes(search.toLowerCase()) || member.email?.toLowerCase().includes(search.toLowerCase()) || member.phone?.toLowerCase().includes(search.toLowerCase());
			const matchesStatus = statusFilter ? member.membershipStatus === statusFilter : true;
			const matchesType = typeFilter ? member.membershipType === typeFilter : true;
			return matchesSearch && matchesStatus && matchesType;
		}) || [];

	// Pagination
	const totalPages = Math.ceil(filteredMemberships.length / MEMBERS_PER_PAGE) || 1;
	const paginatedMemberships = filteredMemberships.slice((currentPage - 1) * MEMBERS_PER_PAGE, currentPage * MEMBERS_PER_PAGE);

	const allIdsOnPage = paginatedMemberships.map((m: Membership) => m._id);
	const allSelectedOnPage = allIdsOnPage.every((id: string) => selectedMemberIds.includes(id));

	const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...allIdsOnPage])));
		} else {
			setSelectedMemberIds((prev) => prev.filter((id) => !allIdsOnPage.includes(id)));
		}
	};

	const handleSelectMember = (id: string) => {
		setSelectedMemberIds((prev) => (prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]));
	};

	const handleBulkDelete = async () => {
		if (!selectedMemberIds.length) return;
		if (!window.confirm("Delete selected memberships?")) return;
		for (const id of selectedMemberIds) {
			await fetch(`/api/membership/${id}`, { method: "DELETE" });
		}
		setSelectedMemberIds([]);
		toast({
			title: "Success",
			description: "Selected memberships deleted successfully",
		});
		mutate();
	};

	const handleBulkStatusChange = async () => {
		if (!selectedMemberIds.length || !bulkStatus) return;

		for (const id of selectedMemberIds) {
			try {
				const response = await fetch(`/api/membership/${id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ membershipStatus: bulkStatus }),
				});
				
				if (!response.ok) {
					throw new Error("Failed to update status");
				}
			} catch (error) {
				console.error("Error updating member:", id, error);
			}
		}
		
		setSelectedMemberIds([]);
		setBulkStatus("");

		toast({
			title: "Success",
			description: bulkStatus === "approved" ? "Selected memberships approved and welcome emails sent successfully" : `Selected memberships ${bulkStatus} successfully`,
		});
		
		mutate();
	};

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) setCurrentPage(page);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return (
					<Badge className="bg-success text-white">
						<CheckCircle className="w-3 h-3 mr-1" />
						Approved
					</Badge>
				);
			case "blocked":
				return (
					<Badge className="bg-red-500 text-white">
						<XCircle className="w-3 h-3 mr-1" />
						Blocked
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-yellow-500 text-white">
						<Clock className="w-3 h-3 mr-1" />
						Pending
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className="max-w-7xl">
			<h1 className="text-2xl font-bold mb-6">Membership Management</h1>

			{/* Filters */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
				<div className="flex gap-2 flex-1">
					<input type="text" placeholder="Search by name, email, phone..." className="border rounded px-3 py-2 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
					<select className="border rounded px-2 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
						<option value="">All Status</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="blocked">Blocked</option>
					</select>
					<select className="border rounded px-2 py-2" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
						<option value="">All Types</option>
						<option value="general">General</option>
						<option value="executive">Executive</option>
					</select>
				</div>
			</div>

			{/* Bulk Actions */}
			<div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
				<div className="flex gap-4 flex-1 items-center pl-2">
					<input type="checkbox" checked={allSelectedOnPage} onChange={handleSelectAll} aria-label="Select all memberships on page" />
					<span className="text-sm">Select All</span>
					<Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedMemberIds.length === 0}>
						Delete Selected
					</Button>
					<select className="border rounded px-2 py-1 text-sm" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} disabled={selectedMemberIds.length === 0}>
						<option value="">Change Status</option>
						<option value="approved">Approved</option>
						<option value="blocked">Block</option>
						<option value="pending">Pending</option>
					</select>
					<Button size="sm" onClick={handleBulkStatusChange} disabled={selectedMemberIds.length === 0 || !bulkStatus}>
						Apply Status
					</Button>
					<Button size="sm" onClick={handlePasswordReset}>Reset Password</Button>
				</div>
				<div className="text-sm text-gray-900">
					Total: {filteredMemberships.length} | Selected: {selectedMemberIds.length}
				</div>
			</div>

			{/* Table */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<input type="checkbox" checked={allSelectedOnPage} onChange={handleSelectAll} />
							</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Phone</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedMemberships.length > 0 ? (
							paginatedMemberships.map((member: Membership) => (
								<TableRow key={member._id}>
									<TableCell>
										<input type="checkbox" checked={selectedMemberIds.includes(member._id)} onChange={() => handleSelectMember(member._id)} />
									</TableCell>
									<TableCell className="font-medium">{member.fullName}</TableCell>
									<TableCell>{member.email}</TableCell>
									<TableCell>{member.phone}</TableCell>
									<TableCell>
										<Badge variant="outline" className="capitalize">
											{member.membershipType}
										</Badge>
									</TableCell>
									<TableCell>{getStatusBadge(member.membershipStatus)}</TableCell>
									<TableCell>{formatDate(member.createdAt)}</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button variant="outline" size="sm" onClick={() => setViewingMember(member)} title="View Details">
												<Eye className="w-4 h-4" />
											</Button>
											<Button variant="outline" size="sm" onClick={() => handleEdit(member)} title="Edit Member">
												<Edit className="w-4 h-4" />
											</Button>
											{member.membershipStatus === "pending" && (
												<>
													<Button variant="outline" size="sm" className="text-success hover:text-success" onClick={() => handleStatusUpdate(member._id, "approved")} title="Approve">
														<CheckCircle className="w-4 h-4" />
													</Button>
													<Button variant="outline" size="sm" className="text-red-600 hover:text-red-600" onClick={() => handleStatusUpdate(member._id, "blocked")} title="Block">
														<XCircle className="w-4 h-4" />
													</Button>
												</>
											)}
											{member.membershipStatus === "approved" && (
												<Button variant="outline" size="sm" className="text-red-600 hover:text-red-600" onClick={() => handleStatusUpdate(member._id, "blocked")} title="Block">
													<XCircle className="w-4 h-4" />
												</Button>
											)}
											{member.membershipStatus === "blocked" && (
												<Button variant="outline" size="sm" className="text-success hover:text-success" onClick={() => handleStatusUpdate(member._id, "approved")} title="Approve">
													<CheckCircle className="w-4 h-4" />
												</Button>
											)}
											<Button variant="outline" size="sm" className="text-red-600 hover:text-red-600" onClick={() => handleDelete(member._id)} title="Delete">
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={8} className="text-center py-8 text-gray-900">
									No memberships found
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between mt-4">
				<div className="text-sm text-gray-900">
					Page {currentPage} of {totalPages}
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
						Previous
					</Button>
					<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
						Next
					</Button>
				</div>
			</div>

			{/* View Member Modal */}
			{viewingMember && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setViewingMember(null)}>
					<div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
						{/* Header with gradient background */}
						<div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
							<button onClick={() => setViewingMember(null)} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200">
								<X className="w-5 h-5" />
							</button>
							<h2 className="text-3xl font-bold text-white mb-2">Member Profile</h2>
							<p className="text-blue-100">Detailed membership information</p>
						</div>

						<div className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
							{/* Profile Photo & Quick Info */}
							<div className="flex flex-col items-center mb-8">
								<div className="relative mb-4">
									<div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-xl ring-4 ring-white">{viewingMember.profilePhoto ? <Image src={viewingMember.profilePhoto} alt={viewingMember.fullName} width={128} height={128} className="w-full h-full object-cover" /> : <User className="w-16 h-16 text-gray-900" />}</div>
									<div className="absolute -bottom-2 -right-2">{getStatusBadge(viewingMember.membershipStatus)}</div>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-1">{viewingMember.fullName}</h3>
								<Badge variant="outline" className="capitalize text-sm">
									{viewingMember.membershipType} Member
								</Badge>
							</div>

							{/* Contact Information Card */}
							<Card className="mb-6 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Mail className="w-5 h-5 text-brand_primary" />
										Contact Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-start gap-3">
											<Mail className="w-5 h-5 text-gray-900 mt-0.5" />
											<div>
												<p className="text-xs text-gray-900 font-medium">Email</p>
												<p className="text-gray-900">{viewingMember.email}</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Phone className="w-5 h-5 text-gray-900 mt-0.5" />
											<div>
												<p className="text-xs text-gray-900 font-medium">Phone</p>
												<p className="text-gray-900">{viewingMember.phone}</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<Calendar className="w-5 h-5 text-gray-900 mt-0.5" />
											<div>
												<p className="text-xs text-gray-900 font-medium">Date of Birth</p>
												<p className="text-gray-900">{viewingMember.dateOfBirth}</p>
											</div>
										</div>
										<div className="flex items-start gap-3">
											<User className="w-5 h-5 text-gray-900 mt-0.5" />
											<div>
												<p className="text-xs text-gray-900 font-medium">Gender</p>
												<p className="text-gray-900 capitalize">{viewingMember.gender}</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Location Information Card */}
							<Card className="mb-6 border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-lg">
										<MapPin className="w-5 h-5 text-success" />
										Location Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<p className="text-xs text-gray-900 font-medium mb-1">Norway Address</p>
											<p className="text-gray-900">{viewingMember.address}</p>
											<p className="text-gray-900">
												{viewingMember.city}, {viewingMember.postalCode}
											</p>
										</div>
										{(viewingMember.province || viewingMember.district) && (
											<div className="pt-4 border-t">
												<p className="text-xs text-gray-900 font-medium mb-1">Nepal Address</p>
												<p className="text-gray-900">
													{viewingMember.province && `Province: ${viewingMember.province}`}
													{viewingMember.province && viewingMember.district && " | "}
													{viewingMember.district && `District: ${viewingMember.district}`}
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Professional Information Card */}
							<Card className="mb-6 border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Briefcase className="w-5 h-5 text-purple-600" />
										Professional Details
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div>
											<p className="text-xs text-gray-900 font-medium mb-1">Profession</p>
											<p className="text-gray-900">{viewingMember.profession || "Not specified"}</p>
										</div>
										<div>
											<p className="text-xs text-gray-900 font-medium mb-1">Skills & Expertise</p>
											<p className="text-gray-900">{viewingMember.skills || "Not specified"}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Volunteer Interests Card */}
							<Card className="mb-6 border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Heart className="w-5 h-5 text-orange-600" />
										Areas of Interest
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										{viewingMember.volunteerInterest && viewingMember.volunteerInterest.length > 0 ? (
											viewingMember.volunteerInterest.map((interest: string, index: number) => (
												<Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
													{interest}
												</Badge>
											))
										) : (
											<span className="text-gray-900">No interests specified</span>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Membership Information Card */}
							<Card className="mb-6 border-l-4 border-l-indigo-500 shadow-md hover:shadow-lg transition-shadow">
								<CardHeader className="pb-3">
									<CardTitle className="flex items-center gap-2 text-lg">
										<Award className="w-5 h-5 text-indigo-600" />
										Membership Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-gray-900 font-medium mb-1">National Membership No</p>
											<p className="text-gray-900 font-mono">{viewingMember.nationalMembershipNo || "Not assigned"}</p>
										</div>
										<div>
											<p className="text-xs text-gray-900 font-medium mb-1">Registration Date</p>
											<p className="text-gray-900">{formatDate(viewingMember.createdAt)}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Action Buttons Footer */}
						<div className="border-t bg-light px-8 py-4">
							<div className="flex gap-3">
								{viewingMember.membershipStatus === "pending" && (
									<>
										<Button
											className="flex-1 bg-success hover:bg-success shadow-md hover:shadow-lg transition-all"
											onClick={() => {
												handleStatusUpdate(viewingMember._id, "approved");
												setViewingMember(null);
											}}
										>
											<CheckCircle className="w-4 h-4 mr-2" />
											Approve Membership
										</Button>
										<Button
											className="flex-1 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
											onClick={() => {
												handleStatusUpdate(viewingMember._id, "blocked");
												setViewingMember(null);
											}}
										>
											<XCircle className="w-4 h-4 mr-2" />
											Block Membership
										</Button>
									</>
								)}
								{viewingMember.membershipStatus === "approved" && (
									<Button
										className="flex-1 bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all"
										onClick={() => {
											handleStatusUpdate(viewingMember._id, "blocked");
											setViewingMember(null);
										}}
									>
										<XCircle className="w-4 h-4 mr-2" />
										Block Member
									</Button>
								)}
								{viewingMember.membershipStatus === "blocked" && (
									<Button
										className="flex-1 bg-success hover:bg-success shadow-md hover:shadow-lg transition-all"
										onClick={() => {
											handleStatusUpdate(viewingMember._id, "approved");
											setViewingMember(null);
										}}
									>
										<CheckCircle className="w-4 h-4 mr-2" />
										Approve Member
									</Button>
								)}
								<Button variant="outline" onClick={() => setViewingMember(null)} className="px-6">
									Close
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Edit Member Modal */}
			{editingMember && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setEditingMember(null)}>
					<div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
						{/* Header */}
						<div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
							<button onClick={() => setEditingMember(null)} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200">
								<X className="w-5 h-5" />
							</button>
							<h2 className="text-3xl font-bold text-white mb-2">Edit Member</h2>
							<p className="text-blue-100">Update membership information</p>
						</div>

						{/* Form */}
						<form onSubmit={handleEditSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Personal Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
									
									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Full Name *</label>
										<input
											type="text"
											value={editFormData.fullName || ''}
											onChange={(e) => handleEditChange('fullName', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
										<input
											type="email"
											value={editFormData.email || ''}
											onChange={(e) => handleEditChange('email', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Phone *</label>
										<input
											type="tel"
											value={editFormData.phone || ''}
											onChange={(e) => handleEditChange('phone', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Date of Birth</label>
										<input
											type="date"
											value={editFormData.dateOfBirth || ''}
											onChange={(e) => handleEditChange('dateOfBirth', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Gender</label>
										<select
											value={editFormData.gender || ''}
											onChange={(e) => handleEditChange('gender', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="">Select Gender</option>
											<option value="male">Male</option>
											<option value="female">Female</option>
											<option value="other">Other</option>
											<option value="prefer-not-to-say">Prefer not to say</option>
										</select>
									</div>
								</div>

								{/* Location & Professional Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Professional</h3>
									
									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
										<input
											type="text"
											value={editFormData.address || ''}
											onChange={(e) => handleEditChange('address', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">City</label>
										<input
											type="text"
											value={editFormData.city || ''}
											onChange={(e) => handleEditChange('city', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Postal Code</label>
										<input
											type="text"
											value={editFormData.postalCode || ''}
											onChange={(e) => handleEditChange('postalCode', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Profession</label>
										<input
											type="text"
											value={editFormData.profession || ''}
											onChange={(e) => handleEditChange('profession', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Skills</label>
										<textarea
											value={editFormData.skills || ''}
											onChange={(e) => handleEditChange('skills', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											rows={3}
										/>
									</div>
								</div>
							</div>

							{/* Membership Information */}
							<div className="mt-6 space-y-4">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Details</h3>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Membership Type</label>
										<select
											value={editFormData.membershipType || ''}
											onChange={(e) => handleEditChange('membershipType', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="general">General</option>
											<option value="executive">Executive</option>
										</select>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Membership Status</label>
										<select
											value={editFormData.membershipStatus || ''}
											onChange={(e) => handleEditChange('membershipStatus', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option value="pending">Pending</option>
											<option value="approved">Approved</option>
											<option value="blocked">Blocked</option>
										</select>
									</div>
								</div>

								{/* Permissions */}
								<div className="mt-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
									<div className="space-y-3">
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={editFormData.permissionPhotos || false}
												onChange={(e) => handleEditChange('permissionPhotos', e.target.checked)}
												className="w-4 h-4 text-blue-600 rounded"
											/>
											<span className="ml-2 text-gray-900">Permission to use photos</span>
										</label>
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={editFormData.permissionPhone || false}
												onChange={(e) => handleEditChange('permissionPhone', e.target.checked)}
												className="w-4 h-4 text-blue-600 rounded"
											/>
											<span className="ml-2 text-gray-900">Permission to contact by phone</span>
										</label>
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={editFormData.permissionEmail || false}
												onChange={(e) => handleEditChange('permissionEmail', e.target.checked)}
												className="w-4 h-4 text-blue-600 rounded"
											/>
											<span className="ml-2 text-gray-900">Permission to contact by email</span>
										</label>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="border-t bg-gray-50 px-8 py-4 mt-6">
								<div className="flex gap-3">
									<Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
										Save Changes
									</Button>
									<Button type="button" variant="outline" onClick={() => setEditingMember(null)} className="px-6">
										Cancel
									</Button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
