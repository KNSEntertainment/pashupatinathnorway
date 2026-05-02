"use client";

import React, { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, CheckCircle, XCircle, Clock, User, Mail, Phone, X, Edit, Download, Upload, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Membership } from "@/types";
import { Link } from "@/i18n/navigation";

const calculateAgeFromPersonalNumber = (personalNumber: string): number | null => {
	if (!personalNumber || personalNumber.length !== 11 || !/^\d{11}$/.test(personalNumber)) {
		return null;
	}

	const day = parseInt(personalNumber.substring(0, 2));
	const month = parseInt(personalNumber.substring(2, 4)) - 1;
	const yearShort = parseInt(personalNumber.substring(4, 6));
	const individualNumber = parseInt(personalNumber.substring(6, 9));
	const currentYear = new Date().getFullYear();

	let fullYear: number;

	// Individual number 750–999 with year 00–39 → born 2000–2039
	if (individualNumber >= 750 && individualNumber <= 999 && yearShort <= 39) {
		fullYear = 2000 + yearShort;
	} else {
		// Everyone else in 0-99 age range → born 1900–1999
		fullYear = 1900 + yearShort;
	}

	// Safety check: if resolved year is somehow in the future, step back
	if (fullYear > currentYear) {
		fullYear -= 100;
	}

	// Calculate exact age
	const birthDate = new Date(fullYear, month, day);
	const today = new Date();

	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	// Reject if outside supported range
	if (age < 0 || age > 99) {
		return null;
	}

	return age;
};

const getGenderFromPersonalNumber = (personalNumber: string): string | null => {
	if (!personalNumber || personalNumber.length !== 11 || !/^\d{11}$/.test(personalNumber)) {
		return null;
	}

	// In Norwegian personal numbers, the 9th digit (index 8) indicates gender
	// Odd numbers = male, even numbers = female
	const genderDigit = parseInt(personalNumber.charAt(8));
	
	if (isNaN(genderDigit)) {
		return null;
	}

	return genderDigit % 2 === 0 ? 'female' : 'male';
};

const maskPersonalNumber = (personalNumber: string): string => {
	if (!personalNumber || personalNumber.length < 5) {
		return personalNumber || 'Not specified';
	}
	
	// Show first 6 digits, mask last 5 with asterisks
	const visiblePart = personalNumber.substring(0, 6);
	const maskedPart = '*****';
	return `${visiblePart}${maskedPart}`;
};

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
			firstName: member.firstName,
			middleName: member.middleName || '',
			lastName: member.lastName,
			email: member.email,
			phone: member.phone,
			address: member.address,
			city: member.city,
			postalCode: member.postalCode,
			personalNumber: member.personalNumber,
			gender: member.gender,
			fylke: member.fylke,
			kommune: member.kommune,
			membershipType: member.membershipType,
			membershipStatus: member.membershipStatus,
	
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
		if (!firstSelectedId) return;
		
		// Find the member from paginated data
		const selectedMember = paginatedMemberships.find((member: Membership) => member._id === firstSelectedId) as Membership | undefined;
		if (!selectedMember) return;
		
		const memberName = `${selectedMember.firstName} ${selectedMember.middleName ? selectedMember.middleName + ' ' : ''}${selectedMember.lastName}`;
		const memberEmail = selectedMember.email;
		
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
	};

	const filteredMemberships =
		memberships?.filter((member: Membership) => {
			const matchesSearch = `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`.toLowerCase().includes(search.toLowerCase()) || member.email?.toLowerCase().includes(search.toLowerCase()) || member.phone?.toLowerCase().includes(search.toLowerCase());
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

		// Check if trying to approve General members
		if (bulkStatus === "approved") {
			for (const id of selectedMemberIds) {
				const member = paginatedMemberships.find((m: Membership) => m._id === id) as Membership | undefined;
				if (member?.membershipType === "General") {
					toast({
						title: "Cannot Approve",
						description: "General members cannot be approved. Please change their membership type to Active first.",
						variant: "destructive",
					});
					return; // Stop execution
				}
			}
		}

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

	const downloadExcel = async () => {
		try {
			// Build query parameters
			const params = new URLSearchParams();
			if (search) params.append('search', search);
			if (statusFilter) params.append('status', statusFilter);
			if (typeFilter) params.append('type', typeFilter);

			const response = await fetch(`/api/membership/download-excel?${params}`);
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to download Excel file');
			}

			// Get filename from response headers or create one
			const contentDisposition = response.headers.get('content-disposition');
			let filename = 'members.xlsx';
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
				if (filenameMatch) filename = filenameMatch[1];
			}

			// Create blob and download
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast({
				title: "Success",
				description: `Excel file "${filename}" downloaded successfully`,
			});
		} catch (error) {
			console.error('Download Excel error:', error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to download Excel file",
				variant: "destructive",
			});
		}
	};

	const downloadCSV = async () => {
		try {
			// Build query parameters
			const params = new URLSearchParams();
			if (search) params.append('search', search);
			if (statusFilter) params.append('status', statusFilter);
			if (typeFilter) params.append('type', typeFilter);

			const response = await fetch(`/api/membership/download-csv?${params}`);
			
			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to download CSV file');
			}

			// Get filename from response headers or create one
			const contentDisposition = response.headers.get('content-disposition');
			let filename = 'members.csv';
			if (contentDisposition) {
				const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
				if (filenameMatch) filename = filenameMatch[1];
			}

			// Create blob and download
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast({
				title: "Success",
				description: `CSV file "${filename}" downloaded successfully`,
			});
		} catch (error) {
			console.error('Download CSV error:', error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to download CSV file",
				variant: "destructive",
			});
		}
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

	const formatDateTime = (date: string) => {
		return new Date(date).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
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
						<option value="General">General member</option>
						<option value="Active">Active member</option>
					</select>
				</div>
			</div>

			{/* Bulk Actions */}
			<div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
				<div className="flex gap-4 flex-1 items-center">
					<Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={selectedMemberIds.length === 0}>
						Delete Selected
					</Button>
					<select className="border rounded px-2 py-1 text-sm" value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} disabled={selectedMemberIds.length === 0}>
						<option value="">Change Status</option>
						<option value="approved">Approved</option>
						<option value="blocked">Block</option>
						<option value="pending">Pending</option>
					</select>
					<Button size="sm" onClick={handleBulkStatusChange} disabled={selectedMemberIds.length === 0 || !bulkStatus || (bulkStatus === 'approved')}>
						Apply Status
					</Button>
					{(() => {
						// Check if any selected member has "approved" status
						const hasActiveMemberSelected = selectedMemberIds.some(id => {
							const member = paginatedMemberships.find((m: Membership) => m._id === id) as Membership | undefined;
							return member?.membershipStatus === "approved";
						});
						
						return (
							<Button 
								size="sm" 
								onClick={handlePasswordReset} 
								disabled={!hasActiveMemberSelected}
							>
								Reset Password
							</Button>
						);
					})()}
				</div>
				<div className="flex gap-3 items-center">
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button size="sm" className="flex items-center gap-2">
								<Download className="w-4 h-4" />
								Download Excel
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle className="flex items-center gap-2">
									<AlertTriangle className="w-5 h-5 text-orange-600" />
									Confirm Download Excel
								</AlertDialogTitle>
								<AlertDialogDescription>
									<div className="space-y-3">
										<p>
											You are about to download an Excel file containing {filteredMemberships.length} members.
											{search && ` Search: "${search}"`}
											{statusFilter && ` Status: ${statusFilter}`}
											{typeFilter && ` Type: ${typeFilter}`}
										</p>
										<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
											<p className="text-sm text-orange-800">
												<strong>Important:</strong> This action will be recorded with your user information and timestamp. 
												The system will log who performed this download and when it occurred.
											</p>
										</div>
										<p className="text-sm text-gray-600">
											Do you want to proceed with the download?
										</p>
									</div>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={downloadExcel}>
									Yes, Download Excel
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button size="sm" variant="outline" className="flex items-center gap-2">
								<Download className="w-4 h-4" />
								Download CSV
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle className="flex items-center gap-2">
									<AlertTriangle className="w-5 h-5 text-orange-600" />
									Confirm Download CSV
								</AlertDialogTitle>
								<AlertDialogDescription>
									<div className="space-y-3">
										<p>
											You are about to download a CSV file containing {filteredMemberships.length} members.
											{search && ` Search: "${search}"`}
											{statusFilter && ` Status: ${statusFilter}`}
											{typeFilter && ` Type: ${typeFilter}`}
										</p>
										<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
											<p className="text-sm text-orange-800">
												<strong>Important:</strong> This action will be recorded with your user information and timestamp. 
												The system will log who performed this download and when it occurred.
											</p>
										</div>
										<p className="text-sm text-gray-600">
											Do you want to proceed with the download?
										</p>
									</div>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={downloadCSV}>
									Yes, Download CSV
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<Link href="/dashboard/bulk-upload">
						<Button size="sm" variant="secondary" className="flex items-center gap-2">
							<Upload className="w-4 h-4" />
							Bulk Upload
						</Button>
					</Link>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				{/* Pagination Controls - Top */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between px-4 py-3 border-b">
						<div className="text-sm text-gray-900">
							Showing {(currentPage - 1) * MEMBERS_PER_PAGE + 1} to {Math.min(currentPage * MEMBERS_PER_PAGE, filteredMemberships.length)} of {filteredMemberships.length} members
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</Button>
							
							<div className="flex items-center gap-1">
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<Button
										key={page}
										variant={currentPage === page ? "default" : "outline"}
										size="sm"
										onClick={() => handlePageChange(page)}
										className="w-8 h-8 p-0"
									>
										{page}
									</Button>
								))}
							</div>
							
							<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
								Next
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12">
								<input type="checkbox" checked={allSelectedOnPage} onChange={handleSelectAll} className="w-5 h-5" />
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
								<TableRow 
									key={member._id}
									className={`cursor-pointer hover:bg-gray-50 ${selectedMemberIds.includes(member._id) ? 'bg-blue-50' : ''}`}
									onClick={() => handleSelectMember(member._id)}
								>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<input type="checkbox" checked={selectedMemberIds.includes(member._id)} onChange={() => handleSelectMember(member._id)} className="w-5 h-5" />
									</TableCell>
									<TableCell className="font-medium">{`${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`}</TableCell>
									<TableCell>{member.email}</TableCell>
									<TableCell>{member.phone}</TableCell>
									<TableCell>
										<Badge 
											variant="outline" 
											className={`capitalize ${
												member.membershipType === 'General'
													? 'bg-blue-50 text-blue-700 border-blue-200' 
													: 'bg-green-50 text-green-700 border-green-200'
											}`}
										>
											{member.membershipType}
										</Badge>
									</TableCell>
									<TableCell>{getStatusBadge(member.membershipStatus)}</TableCell>
									<TableCell>{formatDate(member.createdAt)}</TableCell>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<div className="flex gap-2">
											<Button variant="outline" size="sm" onClick={() => setViewingMember(member)} title="View Details">
												<Eye className="w-4 h-4" />
											</Button>
											<Button variant="outline" size="sm" onClick={() => handleEdit(member)} title="Edit Member">
												<Edit className="w-4 h-4" />
											</Button>
											{member.membershipStatus === "pending" && (
												<>
													{(() => {
														const age = calculateAgeFromPersonalNumber(member.personalNumber || '');
														const canApprove = age !== null && age >= 15;
														return (
															<Button 
																variant="outline" 
																size="sm" 
																className={`text-success hover:text-success ${!canApprove ? 'opacity-50 cursor-not-allowed' : ''}`} 
																onClick={() => {
																	if (canApprove) {
																		handleStatusUpdate(member._id, "approved");
																	} else {
																		toast({
																			title: "Cannot Approve",
																			description: `Member is ${age} years old. Cannot approve members under 15 years old.`,
																			variant: "destructive",
																		});
																	}
																}} 
																title={canApprove ? "Approve" : `Cannot approve: Member is ${age} years old (under 15)`}
																disabled={!canApprove}
															>
																<CheckCircle className="w-4 h-4" />
															</Button>
														);
													})()}
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

			{/* View Member Modal - Minimalist Design */}
			{viewingMember && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingMember(null)}>
					<div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
						{/* Simple Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b">
							<h2 className="text-xl font-semibold text-gray-900">Member Details</h2>
							<button onClick={() => setViewingMember(null)} className="text-gray-400 hover:text-gray-600">
								<X className="w-5 h-5" />
							</button>
						</div>

						<div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
							{/* Basic Info */}
							<div className="flex items-start gap-4 mb-6">
								{viewingMember.profilePhoto ? (
									<Image 
										src={viewingMember.profilePhoto} 
										alt={`${viewingMember.firstName} ${viewingMember.middleName ? viewingMember.middleName + ' ' : ''}${viewingMember.lastName}`} 
										width={80} 
										height={80} 
										className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" 
									/>
								) : (
									<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
										<User className="w-8 h-8 text-gray-500" />
									</div>
								)}
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-gray-900 mb-1">
										{`${viewingMember.firstName} ${viewingMember.middleName ? viewingMember.middleName + ' ' : ''}${viewingMember.lastName}`}
									</h3>
									<div className="flex items-center gap-2 mb-2">
										<Badge 
											variant="outline" 
											className={`capitalize ${
												viewingMember.membershipType === 'General'
													? 'bg-blue-50 text-blue-700 border-blue-200' 
													: 'bg-green-50 text-green-700 border-green-200'
											}`}
										>
											{viewingMember.membershipType}
										</Badge>
										{getStatusBadge(viewingMember.membershipStatus)}
									</div>
									<div className="space-y-1 text-sm text-gray-600">
										<div className="flex items-center gap-2">
											<Mail className="w-4 h-4" />
											{viewingMember.email}
										</div>
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4" />
											{viewingMember.phone}
										</div>
									</div>
								</div>
							</div>

							{/* Additional Info */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
								<div>
									<p className="font-medium text-gray-900 mb-1">Personal Number</p>
									<p className="text-gray-600">{maskPersonalNumber(viewingMember.personalNumber || '')}</p>
								</div>
								<div>
									<p className="font-medium text-gray-900 mb-1">Gender</p>
									<p className="text-gray-600 capitalize">
										{(() => {
											const genderFromPersonalNumber = getGenderFromPersonalNumber(viewingMember.personalNumber || '');
											return genderFromPersonalNumber || viewingMember.gender || 'Unknown';
										})()}
									</p>
								</div>
								<div>
									<p className="font-medium text-gray-900 mb-1">Address</p>
									<p className="text-gray-600">{viewingMember.address}</p>
								</div>
								<div>
									<p className="font-medium text-gray-900 mb-1">City</p>
									<p className="text-gray-600">{viewingMember.city}</p>
								</div>
								<div>
									<p className="font-medium text-gray-900 mb-1">Postal Code</p>
									<p className="text-gray-600">{viewingMember.postalCode}</p>
								</div>
							
								<div>
									<p className="font-medium text-gray-900 mb-1">Registered as a General Member Since</p>
									<p className="text-gray-600">
										{viewingMember.generalMemberSince 
											? formatDateTime(viewingMember.generalMemberSince)
											: viewingMember.createdAt 
												? formatDateTime(viewingMember.createdAt)
												: 'Not specified'
										}
									</p>
								</div>
								{viewingMember.membershipType === 'Active' && (
									<div>
										<p className="font-medium text-gray-900 mb-1">Active Member Since</p>
										<p className="text-gray-600">
											{viewingMember.activeMemberSince 
												? formatDateTime(viewingMember.activeMemberSince)
												: 'Not approved yet'
											}
										</p>
								
									</div>
								)}
								<div>
									<p className="font-medium text-gray-900 mb-1">Age</p>
									<p className="text-gray-600">
										{(() => {
											const age = calculateAgeFromPersonalNumber(viewingMember.personalNumber || '');
											return age !== null ? `${age} years` : 'Unknown';
										})()}
									</p>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 px-6 py-4 border-t">
							{viewingMember.membershipStatus === "pending" && (
								<>
									{(() => {
										const age = calculateAgeFromPersonalNumber(viewingMember.personalNumber || '');
										const canApprove = age !== null && age >= 15;
										return (
											<Button
												className={`flex-1 ${canApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
												onClick={() => {
													if (canApprove) {
														handleStatusUpdate(viewingMember._id, "approved");
														setViewingMember(null);
													} else {
														toast({
															title: "Cannot Approve",
															description: `Member is ${age} years old. Cannot approve members under 15 years old.`,
															variant: "destructive",
														});
													}
												}}
												disabled={!canApprove}
											>
												<CheckCircle className="w-4 h-4 mr-2" />
												Approve
											</Button>
										);
									})()}
									<Button
										className="flex-1 bg-red-600 hover:bg-red-700"
										onClick={() => {
											handleStatusUpdate(viewingMember._id, "blocked");
											setViewingMember(null);
										}}
									>
										<XCircle className="w-4 h-4 mr-2" />
										Block
									</Button>
								</>
							)}
							{viewingMember.membershipStatus === "approved" && (
								<Button
									className="flex-1 bg-red-600 hover:bg-red-700"
									onClick={() => {
										handleStatusUpdate(viewingMember._id, "blocked");
										setViewingMember(null);
									}}
								>
									<XCircle className="w-4 h-4 mr-2" />
									Block
								</Button>
							)}
							{viewingMember.membershipStatus === "blocked" && (
								<Button
									className="flex-1 bg-green-600 hover:bg-green-700"
									onClick={() => {
										handleStatusUpdate(viewingMember._id, "approved");
										setViewingMember(null);
									}}
								>
									<CheckCircle className="w-4 h-4 mr-2" />
									Approve
								</Button>
							)}
							<Button variant="outline" onClick={() => setViewingMember(null)}>
								Close
							</Button>
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
										<label className="block text-sm font-medium text-gray-900 mb-2">First Name *</label>
										<input
											type="text"
											value={editFormData.firstName || ''}
											onChange={(e) => handleEditChange('firstName', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Middle Name</label>
										<input
											type="text"
											value={editFormData.middleName || ''}
											onChange={(e) => handleEditChange('middleName', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Last Name *</label>
										<input
											type="text"
											value={editFormData.lastName || ''}
											onChange={(e) => handleEditChange('lastName', e.target.value)}
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

						

								
								</div>

								{/* Location Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
									
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
										<label className="block text-sm font-medium text-gray-900 mb-2">Fylke</label>
										<input
											type="text"
											value={editFormData.fylke || ''}
											onChange={(e) => handleEditChange('fylke', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Kommune</label>
										<input
											type="text"
											value={editFormData.kommune || ''}
											onChange={(e) => handleEditChange('kommune', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
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
