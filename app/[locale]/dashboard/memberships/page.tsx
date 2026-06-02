"use client";

import React, { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, CheckCircle, XCircle, Clock, User, Mail, Phone, X, Edit, Download, Upload, ChevronLeft, ChevronRight, AlertTriangle, Plus, Crown, Users, Key } from "lucide-react";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
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
import { Membership } from "@/types";
import { Link } from "@/i18n/navigation";
import ExecutiveMemberReorder from "@/components/ExecutiveMemberReorder";

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





const maskPersonalNumber = (personalNumber: string): string => {
	if (!personalNumber || personalNumber.length < 5) {
		return personalNumber || 'Not provided';
	}
	const visiblePart = personalNumber.slice(0, -5);
	const maskedPart = '*****';
	return visiblePart + maskedPart;
};

export default function MembershipsPage() {
	const [activeTab, setActiveTab] = useState<"members" | "executive">("members");
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
	const [bulkStatus, setBulkStatus] = useState("");
	const [bulkType, setBulkType] = useState("");
	const [viewingMember, setViewingMember] = useState<Membership | null>(null);
	const [editingMember, setEditingMember] = useState<Membership | null>(null);
	const [editFormData, setEditFormData] = useState<Partial<Membership>>({});
	const [addingMember, setAddingMember] = useState(false);
	const [addFormData, setAddFormData] = useState<Partial<Membership>>({
		membershipType: "General",
		membershipStatus: "pending"
	});
	const [passwordResetLoading, setPasswordResetLoading] = useState<string[]>([]);
	const MEMBERS_PER_PAGE = 500;
	const { data: memberships, error, loading, mutate } = useFetchData("/api/membership", "memberships");
	const { toast } = useToast();

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	// const handleDelete = async (id: string) => {
	// 	if (window.confirm("Are you sure you want to delete this membership?")) {
	// 		try {
	// 			const response = await fetch(`/api/membership/${id}`, {
	// 				method: "DELETE",
	// 			});
	// 			if (!response.ok) {
	// 				throw new Error("Failed to delete membership");
	// 			}
	// 			toast({
	// 				title: "Success",
	// 				description: "Membership deleted successfully",
	// 			});
	// 			mutate();
	// 		} catch (error) {
	// 			console.error("Error deleting membership:", error);
	// 			toast({
	// 				title: "Error",
	// 				description: "Failed to delete membership. Please try again.",
	// 				variant: "destructive",
	// 			});
	// 		}
	// 	}
	// };

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
			position: member.position || '',
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

	const handleAddChange = (field: string, value: string | boolean) => {
		setAddFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleAddSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// Create member via membership API (all types including Executive/Advisor with positions)
			const response = await fetch('/api/membership', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(addFormData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to add member');
			}

			toast({
				title: "Success",
				description: "Member added successfully",
			});

			setAddingMember(false);
			setAddFormData({
				membershipType: "General",
				membershipStatus: "pending"
			});
			mutate();
		} catch (error) {
			console.error('Error adding member:', error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to add member. Please try again.",
				variant: "destructive",
			});
		}
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
			const response = await fetch('/api/password/request-reset', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					targetEmail: memberEmail,
					isAdmin: true,
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

	const handleIndividualPasswordReset = async (member: Membership) => {
		const memberName = `${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`;
		const memberEmail = member.email;

		// Validate that we have a valid email
		if (!memberEmail) {
			toast({
				title: "Error",
				description: "Member does not have a valid email address.",
				variant: "destructive",
			});
			return;
		}

		// Only allow password reset for approved members
		if (member.membershipStatus !== "approved") {
			toast({
				title: "Cannot Reset Password",
				description: "Password reset is only available for approved members.",
				variant: "destructive",
			});
			return;
		}

		// Set loading state for this member
		setPasswordResetLoading(prev => [...prev, member._id]);

		// Send password reset email
		try {
			const response = await fetch('/api/password/request-reset', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					targetEmail: memberEmail,
					isAdmin: true,
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
		} finally {
			// Remove loading state for this member
			setPasswordResetLoading(prev => prev.filter(id => id !== member._id));
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

	const handleBulkTypeChange = async () => {
		if (!selectedMemberIds.length || !bulkType) return;

		// Check if trying to change non-active members to Executive
		if (bulkType === "Executive") {
			for (const id of selectedMemberIds) {
				const member = paginatedMemberships.find((m: Membership) => m._id === id) as Membership | undefined;
				if (member?.membershipType !== "Active") {
					toast({
						title: "Cannot Change to Executive",
						description: "Only Active members can be changed to Executive. Please change their membership type to Active first.",
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
					body: JSON.stringify({ membershipType: bulkType }),
				});
				
				if (!response.ok) {
					throw new Error("Failed to update membership type");
				}
			} catch (error) {
				console.error("Error updating member type:", id, error);
			}
		}
		
		setSelectedMemberIds([]);
		setBulkType("");

		toast({
			title: "Success",
			description: `Selected memberships updated to ${bulkType} successfully`,
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

	const getPaginationPages = () => {
		const pages: (number | string)[] = [];
		const maxVisiblePages = 5;

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is less than or equal to max visible
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Always show first page
			pages.push(1);

			// Show pages around current page
			let startPage = Math.max(2, currentPage - 1);
			let endPage = Math.min(totalPages - 1, currentPage + 1);

			// Adjust if we're near the start
			if (currentPage <= 3) {
				startPage = 2;
				endPage = Math.min(4, totalPages - 1);
			}

			// Adjust if we're near the end
			if (currentPage >= totalPages - 2) {
				startPage = Math.max(totalPages - 3, 2);
				endPage = totalPages - 1;
			}

			// Add ellipsis if there's a gap after first page
			if (startPage > 2) {
				pages.push('...');
			}

			// Add middle pages
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}

			// Add ellipsis if there's a gap before last page
			if (endPage < totalPages - 1) {
				pages.push('...');
			}

			// Always show last page
			pages.push(totalPages);
		}

		return pages;
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
		if (!date) return 'Not available';
		const dateObj = new Date(date);
		if (isNaN(dateObj.getTime())) return 'Invalid date';
		return dateObj.toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<DashboardPageLayout
			title="Members"
			description="Manage temple membership applications and accounts"
			icon="Users"
		>

			{/* Tab Navigation */}
			<div className="mb-8">
				<div className="border-b border-gray-200">
					<nav className="-mb-px flex space-x-8">
						<button
							onClick={() => setActiveTab("members")}
							className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === "members"
									? "border-brand_primary text-brand_secondary"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<div className="flex items-center gap-2">
								<Users className="w-4 h-4" />
								All Members
							</div>
						</button>
						<button
							onClick={() => setActiveTab("executive")}
							className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
								activeTab === "executive"
									? "border-brand_primary text-brand_secondary"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							<div className="flex items-center gap-2">
								<Crown className="w-4 h-4" />
								Executive Hierarchy
							</div>
						</button>
					</nav>
				</div>
			</div>

			{/* Tab Content */}
			{activeTab === "executive" ? (
				<ExecutiveMemberReorder />
			) : (
				<>
					<div className="mb-8">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div></div>
							<div className="flex items-center gap-3">
						<Button onClick={() => setAddingMember(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
							<Plus className="w-4 h-4" />
							Add a Member
						</Button>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="outline" size="sm" className="flex items-center gap-2">
									<Download className="w-4 h-4" />
									Export
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle className="flex items-center gap-2">
										<AlertTriangle className="w-5 h-5 text-orange-600" />
										Confirm Export
									</AlertDialogTitle>
									<AlertDialogDescription>
										<div className="space-y-3">
											<p>
												You are about to export {filteredMemberships.length} members.
												{search && ` Search: "${search}"`}
												{statusFilter && ` Status: ${statusFilter}`}
												{typeFilter && ` Type: ${typeFilter}`}
											</p>
											<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
												<p className="text-sm text-orange-800">
													<strong>Important:</strong> This action will be recorded with your user information and timestamp.
												</p>
											</div>
											<p className="text-sm text-gray-600">
												Do you want to proceed with the export?
											</p>
										</div>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={downloadExcel}>
									Download Excel
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button size="sm" variant="outline" className="flex items-center gap-2">
								<Download className="w-4 h-4" />
								CSV
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle className="flex items-center gap-2">
									<AlertTriangle className="w-5 h-5 text-orange-600" />
									Confirm CSV Export
								</AlertDialogTitle>
								<AlertDialogDescription>
									<div className="space-y-3">
										<p>
											You are about to export {filteredMemberships.length} members as CSV.
											{search && ` Search: "${search}"`}
											{statusFilter && ` Status: ${statusFilter}`}
											{typeFilter && ` Type: ${typeFilter}`}
										</p>
										<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
											<p className="text-sm text-orange-800">
												<strong>Important:</strong> This action will be recorded with your user information and timestamp.
											</p>
										</div>
										<p className="text-sm text-gray-600">
											Do you want to proceed with the export?
										</p>
									</div>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={downloadCSV}>
									Download CSV
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
					<Link href="/dashboard/bulk-upload">
						<Button size="sm" className="flex items-center gap-2">
							<Upload className="w-4 h-4" />
							Bulk Upload
						</Button>
					</Link>
						</div>
					</div>
				</div>

			{/* Filters Section */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
				<div className="flex flex-col lg:flex-row gap-4">
					<div className="flex-1">
						<input 
							type="text" 
							placeholder="Search members by name, email, phone..." 
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={search} 
							onChange={(e) => setSearch(e.target.value)} 
						/>
					</div>
					<div className="flex gap-3">
						<select 
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={statusFilter} 
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							<option value="">All Status</option>
							<option value="pending">Pending</option>
							<option value="approved">Approved</option>
							<option value="blocked">Blocked</option>
						</select>
						<select 
							className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
							value={typeFilter} 
							onChange={(e) => setTypeFilter(e.target.value)}
						>
							<option value="">All Types</option>
							<option value="General">General Member</option>
							<option value="Active">Active Member</option>
							<option value="Executive">Executive Member</option>
							<option value="Advisor">Advisor</option>
						</select>
					</div>
				</div>
			</div>

			{/* Bulk Actions Section */}
			{selectedMemberIds.length > 0 && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-blue-900">
								{selectedMemberIds.length} member{selectedMemberIds.length > 1 ? 's' : ''} selected
							</span>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button variant="destructive" size="sm" onClick={handleBulkDelete}>
								<Trash2 className="w-4 h-4 mr-1" />
								Delete
							</Button>
							<select 
								className="px-3 py-1 text-sm border border-gray-300 rounded" 
								value={bulkStatus} 
								onChange={(e) => setBulkStatus(e.target.value)}
							>
								<option value="">Change Status</option>
								<option value="approved">Approve</option>
								<option value="blocked">Block</option>
								<option value="pending">Pending</option>
							</select>
							<Button size="sm" onClick={handleBulkStatusChange} disabled={!bulkStatus}>
								Apply
							</Button>
							<select 
								className="px-3 py-1 text-sm border border-gray-300 rounded" 
								value={bulkType} 
								onChange={(e) => setBulkType(e.target.value)}
							>
								<option value="">Change Type</option>
								<option value="General">General Member</option>
								<option value="Active">Active Member</option>
								<option value="Executive">Executive Member</option>
								<option value="Advisor">Advisor</option>
							</select>
							<Button size="sm" onClick={handleBulkTypeChange} disabled={!bulkType}>
								Apply Type
							</Button>
							{(() => {
								const hasActiveMemberSelected = selectedMemberIds.some(id => {
									const member = paginatedMemberships.find((m: Membership) => m._id === id) as Membership | undefined;
									return member?.membershipStatus === "approved";
								});
								
								return (
									<Button 
										size="sm" 
										variant="outline"
										onClick={handlePasswordReset} 
										disabled={!hasActiveMemberSelected}
									>
										Reset Password
									</Button>
								);
							})()}
						</div>
					</div>
				</div>
			)}

			{/* Members Table */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				{/* Pagination Controls - Top */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
						<div className="text-sm text-gray-600">
							Showing {(currentPage - 1) * MEMBERS_PER_PAGE + 1} to {Math.min(currentPage * MEMBERS_PER_PAGE, filteredMemberships.length)} of {filteredMemberships.length} members
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</Button>
							<div className="flex items-center gap-1">
								{getPaginationPages().map((page, index) => (
									page === '...' ? (
										<span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
									) : (
										<Button
											key={page}
											variant={currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => handlePageChange(page as number)}
											className="w-8 h-8 p-0"
										>
											{page}
										</Button>
									)
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
						<TableRow className="border-b border-gray-100 bg-gray-50/50">
							<TableHead className="w-12 font-medium text-gray-700 py-4">
								<input 
									type="checkbox" 
									checked={allSelectedOnPage} 
									onChange={handleSelectAll} 
									className="w-4 h-4 rounded border-gray-300" 
								/>
							</TableHead>
							<TableHead className="font-medium text-gray-700 py-4">Member</TableHead>
							<TableHead className="font-medium text-gray-700 py-4">Contact</TableHead>
							<TableHead className="font-medium text-gray-700 py-4">Type</TableHead>
							<TableHead className="font-medium text-gray-700 py-4">Status</TableHead>
							<TableHead className="font-medium text-gray-700 py-4 text-right pr-6">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paginatedMemberships.length > 0 ? (
							paginatedMemberships.map((member: Membership) => (
								<TableRow 
									key={member._id}
									className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${selectedMemberIds.includes(member._id) ? 'bg-blue-50' : ''}`}
									onClick={() => handleSelectMember(member._id)}
								>
									<TableCell onClick={(e) => e.stopPropagation()} className="py-4">
										<input 
											type="checkbox" 
											checked={selectedMemberIds.includes(member._id)} 
											onChange={() => handleSelectMember(member._id)} 
											className="w-4 h-4 rounded border-gray-300" 
										/>
									</TableCell>
									<TableCell className="py-4">
										<div>
											<div className="font-medium text-gray-900">
												{`${member.firstName} ${member.middleName ? member.middleName + ' ' : ''}${member.lastName}`}
											</div>
										</div>
									</TableCell>
									<TableCell className="py-4">
										<div className="space-y-1">
											<div className="flex items-center gap-1 text-sm text-gray-600">
												<Mail className="w-3 h-3" />
												{member.email}
											</div>
											<div className="flex items-center gap-1 text-sm text-gray-600">
												<Phone className="w-3 h-3" />
												{member.phone}
											</div>
										</div>
									</TableCell>
									<TableCell className="py-4">
										<Badge 
											variant="outline" 
											className={`capitalize ${
												member.membershipType === 'General'
													? 'bg-blue-50 text-blue-700 border-blue-200' 
													: member.membershipType === 'Active'
													? 'bg-green-50 text-green-700 border-green-200'
													: member.membershipType === 'Executive'
													? 'bg-purple-50 text-purple-700 border-purple-200'
													: member.membershipType === 'Advisor'
													? 'bg-orange-50 text-orange-700 border-orange-200'
													: 'bg-gray-50 text-gray-700 border-gray-200'
											}`}
										>
											{member.membershipType}
										</Badge>
									</TableCell>
									<TableCell className="py-4">
										{getStatusBadge(member.membershipStatus)}
									</TableCell>
							
									<TableCell onClick={(e) => e.stopPropagation()} className="py-4 pr-6">
										<div className="flex items-center justify-end gap-2">
											<Button variant="ghost" size="sm" onClick={() => setViewingMember(member)} className="h-8 px-3 text-gray-600 hover:text-gray-900">
												<Eye className="w-4 h-4" />
											</Button>
											<Button variant="ghost" size="sm" onClick={() => handleEdit(member)} className="h-8 px-3 text-gray-600 hover:text-gray-900">
												<Edit className="w-4 h-4" />
											</Button>
{member.membershipStatus === "approved" && (
<Button 
variant="ghost" 
size="sm" 
onClick={() => handleIndividualPasswordReset(member)} 
className="h-8 px-3 text-blue-600 hover:text-blue-700" 
title="Reset password" 
disabled={passwordResetLoading.includes(member._id)} 
>
{passwordResetLoading.includes(member._id) ? (
<div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
) : (
<Key className="w-4 h-4" />
)}
</Button>)}											{member.membershipStatus === "pending" && (
												<>
													{(() => {
														const age = calculateAgeFromPersonalNumber(member.personalNumber || '');
														const canApprove = age !== null && age >= 15;
														return (
															<Button 
																variant="ghost" 
																size="sm" 
																onClick={() => handleStatusUpdate(member._id, 'approved')}
																disabled={!canApprove}
																className="h-8 px-3 text-green-600 hover:text-green-700"
																title={!canApprove ? 'Member must be at least 15 years old' : 'Approve membership'}
															>
																<CheckCircle className="w-4 h-4" />
															</Button>
														);
													})()}
													<Button 
														variant="ghost" 
														size="sm" 
														onClick={() => handleStatusUpdate(member._id, 'blocked')}
														className="h-8 px-3 text-red-600 hover:text-red-700"
														title="Block membership"
													>
														<XCircle className="w-4 h-4" />
													</Button>
												</>
											)}
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-12">
									<div className="text-center">
										<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<User className="w-8 h-8 text-gray-400" />
										</div>
										<h3 className="text-lg font-medium text-gray-900 mb-1">No members found</h3>
										<p className="text-sm text-gray-500">Try adjusting your search or filters</p>
									</div>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				{/* Pagination Controls - Bottom */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
						<div className="text-sm text-gray-600">
							Page {currentPage} of {totalPages}
						</div>
						<div className="flex items-center gap-2">
							<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</Button>
							<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
								Next
								<ChevronRight className="w-4 h-4" />
							</Button>
						</div>
					</div>
				)}
			</div>

			{/* View Member Modal */}
			{viewingMember && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="border-b border-gray-200 p-6">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold text-gray-900">Member Details</h2>
								<Button variant="ghost" size="sm" onClick={() => setViewingMember(null)}>
									<X className="w-5 h-5" />
								</Button>
							</div>
						</div>
						<div className="p-6">
							<div className="space-y-6">
								{/* Personal Information */}
								<div>
									<h3 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Name</p>
											<p className="font-medium">{`${viewingMember.firstName} ${viewingMember.middleName ? viewingMember.middleName + ' ' : ''}${viewingMember.lastName}`}</p>
										</div>
									
										<div>
											<p className="text-sm text-gray-500">Email</p>
											<p className="font-medium">{viewingMember.email}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Phone</p>
											<p className="font-medium">{viewingMember.phone}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Personal Number</p>
											<p className="font-medium">{maskPersonalNumber(viewingMember.personalNumber || '')}</p>
										</div>
									</div>
								</div>

								{/* Address Information */}
								<div>
									<h3 className="text-sm font-medium text-gray-900 mb-3">Address</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="md:col-span-2">
											<p className="text-sm text-gray-500">Street Address</p>
											<p className="font-medium">{viewingMember.address || 'Not provided'}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Postal Code</p>
											<p className="font-medium">{viewingMember.postalCode || 'Not provided'}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">City</p>
											<p className="font-medium">{viewingMember.city || 'Not provided'}</p>
										</div>
									</div>
								</div>

								{/* Membership Information */}
								<div>
									<h3 className="text-sm font-medium text-gray-900 mb-3">Membership</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-500">Type</p>
											<Badge 
												variant="outline" 
												className={`capitalize ${
													viewingMember.membershipType === 'General'
														? 'bg-blue-50 text-blue-700 border-blue-200' 
														: viewingMember.membershipType === 'Active'
														? 'bg-green-50 text-green-700 border-green-200'
														: viewingMember.membershipType === 'Executive'
														? 'bg-purple-50 text-purple-700 border-purple-200'
														: viewingMember.membershipType === 'Advisor'
														? 'bg-orange-50 text-orange-700 border-orange-200'
														: 'bg-gray-50 text-gray-700 border-gray-200'
												}`}
											>
												{viewingMember.membershipType}
											</Badge>
										</div>
										<div>
											<p className="text-sm text-gray-500">Status</p>
											{getStatusBadge(viewingMember.membershipStatus)}
										</div>
										<div>
											<p className="text-sm text-gray-500">Joined Date</p>
											<p className="font-medium">{formatDate(viewingMember.createdAt)}</p>
										</div>
										<div>
											<p className="text-sm text-gray-500">Last Updated</p>
											<p className="font-medium">
												{viewingMember.updatedAt ? formatDateTime(viewingMember.updatedAt) : 'Not available'}
											</p>
										</div>
									</div>
								</div>

								{/* Actions */}
								<div className="flex gap-3 pt-4 border-t">
									<Button onClick={() => handleEdit(viewingMember)}>
										<Edit className="w-4 h-4 mr-2" />
										Edit Member
									</Button>
									{viewingMember.membershipStatus === "pending" && (
										<>
											<Button onClick={() => handleStatusUpdate(viewingMember._id, 'approved')} className="bg-green-600 hover:bg-green-700">
												<CheckCircle className="w-4 h-4 mr-2" />
												Approve
											</Button>
											<Button onClick={() => handleStatusUpdate(viewingMember._id, 'blocked')} variant="destructive">
												<XCircle className="w-4 h-4 mr-2" />
												Block
											</Button>
										</>
									)}
								</div>
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
						<div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
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

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Personal Number *</label>
										<input
											type="text"
											value={editFormData.personalNumber ? maskPersonalNumber(editFormData.personalNumber) : ''}
											onChange={(e) => handleEditChange('personalNumber', e.target.value)}
											onFocus={(e) => {
												if (editFormData.personalNumber && e.target.value === maskPersonalNumber(editFormData.personalNumber)) {
													e.target.value = editFormData.personalNumber;
													handleEditChange('personalNumber', editFormData.personalNumber);
												}
											}}
											placeholder="11-digit personal number (DDMMYYXXXXX)"
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											pattern="\d{11}"
											maxLength={11}
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

								{/* Membership Settings */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Settings</h3>
									
									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Membership Type *</label>
										{(() => {
											const age = calculateAgeFromPersonalNumber(editFormData.personalNumber || '');
											const isUnder15 = age !== null && age < 15;
											return (
												<>
													<select
														value={editFormData.membershipType || 'General'}
														onChange={(e) => handleEditChange('membershipType', e.target.value)}
														className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
															isUnder15 
																? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed' 
																: 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
														}`}
														disabled={isUnder15}
														required
													>
														<option value="General">General Member</option>
														<option value="Active">Active Member</option>
														<option value="Executive">Executive Member</option>
														<option value="Advisor">Advisor</option>
													</select>
													{isUnder15 && (
														<p className="text-sm text-orange-600 mt-1">
															Membership type cannot be changed for members under 15 years old
														</p>
													)}
												</>
											);
										})()}
									</div>

									{/* Position field - only show for Executive/Advisor types */}
									{['Executive', 'Advisor'].includes(editFormData.membershipType || '') && (
										<div>
											<label className="block text-sm font-medium text-gray-900 mb-2">Position *</label>
											<input
												type="text"
												value={editFormData.position || ''}
												onChange={(e) => handleEditChange('position', e.target.value)}
												placeholder="e.g., Chairperson, Secretary, Advisor"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												required
											/>
										</div>
									)}

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Membership Status *</label>
										<select
											value={editFormData.membershipStatus || 'pending'}
											onChange={(e) => handleEditChange('membershipStatus', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										>
											<option value="pending">Pending</option>
											<option value="approved">Approved</option>
											<option value="blocked">Blocked</option>
										</select>
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

			{/* Add Member Modal */}
			{addingMember && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setAddingMember(false)}>
					<div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
						{/* Header */}
						<div className="relative bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
							<button onClick={() => setAddingMember(false)} className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200">
								<X className="w-5 h-5" />
							</button>
							<h2 className="text-3xl font-bold text-white mb-2">Add New Member</h2>
							<p className="text-green-100">Create a new membership account</p>
						</div>

						{/* Form */}
						<form onSubmit={handleAddSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Personal Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
									
									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">First Name *</label>
										<input
											type="text"
											value={addFormData.firstName || ''}
											onChange={(e) => handleAddChange('firstName', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Middle Name</label>
										<input
											type="text"
											value={addFormData.middleName || ''}
											onChange={(e) => handleAddChange('middleName', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Last Name *</label>
										<input
											type="text"
											value={addFormData.lastName || ''}
											onChange={(e) => handleAddChange('lastName', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Email *</label>
										<input
											type="email"
											value={addFormData.email || ''}
											onChange={(e) => handleAddChange('email', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Phone *</label>
										<input
											type="tel"
											value={addFormData.phone || ''}
											onChange={(e) => handleAddChange('phone', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Personal Number</label>
										<input
											type="text"
											value={addFormData.personalNumber || ''}
											onChange={(e) => handleAddChange('personalNumber', e.target.value)}
											placeholder="11-digit personal number"
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Gender</label>
										<select
											value={addFormData.gender || ''}
											onChange={(e) => handleAddChange('gender', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										>
											<option value="">Select Gender</option>
											<option value="male">Male</option>
											<option value="female">Female</option>
											<option value="other">Other</option>
											<option value="prefer_not_to_say">Prefer not to say</option>
										</select>
									</div>
								</div>

								{/* Location & Membership Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Membership</h3>
									
									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Address</label>
										<input
											type="text"
											value={addFormData.address || ''}
											onChange={(e) => handleAddChange('address', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">City</label>
										<input
											type="text"
											value={addFormData.city || ''}
											onChange={(e) => handleAddChange('city', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Postal Code</label>
										<input
											type="text"
											value={addFormData.postalCode || ''}
											onChange={(e) => handleAddChange('postalCode', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Fylke</label>
										<input
											type="text"
											value={addFormData.fylke || ''}
											onChange={(e) => handleAddChange('fylke', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Kommune</label>
										<input
											type="text"
											value={addFormData.kommune || ''}
											onChange={(e) => handleAddChange('kommune', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Membership Type *</label>
										<select
											value={addFormData.membershipType || 'General'}
											onChange={(e) => handleAddChange('membershipType', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											required
										>
											<option value="General">General Member</option>
											<option value="Active">Active Member</option>
											<option value="Executive">Executive Member</option>
											<option value="Advisor">Advisor</option>
										</select>
									</div>

									{/* Position field - only show for Executive/Advisor types */}
									{['Executive', 'Advisor'].includes(addFormData.membershipType || '') && (
										<div>
											<label className="block text-sm font-medium text-gray-900 mb-2">Position *</label>
											<input
												type="text"
												value={addFormData.position || ''}
												onChange={(e) => handleAddChange('position', e.target.value)}
												placeholder="e.g., Chairperson, Secretary, Advisor"
												className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
												required
											/>
										</div>
									)}

									<div>
										<label className="block text-sm font-medium text-gray-900 mb-2">Membership Status *</label>
										<select
											value={addFormData.membershipStatus || 'pending'}
											onChange={(e) => handleAddChange('membershipStatus', e.target.value)}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
											required
										>
											<option value="pending">Pending</option>
											<option value="approved">Approved</option>
											<option value="blocked">Blocked</option>
										</select>
									</div>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="border-t bg-gray-50 px-8 py-4 mt-6">
								<div className="flex gap-3">
									<Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
										Add Member
									</Button>
									<Button type="button" variant="outline" onClick={() => setAddingMember(false)} className="px-6">
										Cancel
									</Button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
				</>
			)}
		</DashboardPageLayout>
	);
}
						



			{/* Pagination */}
			// <div className="flex items-center justify-between mt-4">
			// 	<div className="text-sm text-gray-900">
			// 		Page {currentPage} of {totalPages}
			// 	</div>
			// 	<div className="flex gap-2">
			// 		<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
			// 			Previous
			// 		</Button>
			// 		<Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
			// 			Next
			// 		</Button>
			// 	</div>
			// </div>

		
