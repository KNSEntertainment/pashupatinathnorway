"use client";

import React, { useState, useMemo } from "react";
import useFetchData from "@/hooks/useFetchData";
import { format, isAfter, isBefore, subDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  FileText,
  Bell,
  TrendingUp,
  Download,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import NoticeForm from "@/components/NoticeForm";
import toast from "react-hot-toast";

export default function NoticesPage() {
	const [openNoticeModal, setOpenNoticeModal] = useState(false);
	const [noticeToEdit, setNoticeToEdit] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [sortBy, setSortBy] = useState("date");
	const { data: notices, error, loading, mutate } = useFetchData("/api/notices", "notices");

	// Calculate analytics
	const analytics = useMemo(() => {
		if (!notices) return null;
		
		const now = new Date();
		const last30Days = subDays(now, 30);
		const last7Days = subDays(now, 7);

		const totalNotices = notices.length;
		const recent30Days = notices.filter(n => {
			try {
				return isAfter(parseISO(n.createdAt || n.noticedate), last30Days);
			} catch {
				return false;
			}
		}).length;
		const recent7Days = notices.filter(n => {
			try {
				return isAfter(parseISO(n.createdAt || n.noticedate), last7Days);
			} catch {
				return false;
			}
		}).length;

		// Notices with images
		const withImages = notices.filter(n => n.noticeimage && n.noticeimage !== "/ghanti.png").length;

		return {
			total: totalNotices,
			recent30Days,
			recent7Days,
			withImages,
			withImagesPercentage: totalNotices > 0 ? ((withImages / totalNotices) * 100).toFixed(1) : 0
		};
	}, [notices]);

	// Filter and sort notices
	const filteredNotices = useMemo(() => {
		if (!notices) return [];
		
		let filtered = notices;

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(n => 
				n.noticetitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
				n.notice.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply status filter (based on date - future notices are "upcoming", past are "archived")
		if (statusFilter !== "all") {
			const now = new Date();
			filtered = filtered.filter(n => {
				try {
					const noticeDate = parseISO(n.noticedate);
					if (statusFilter === "upcoming") {
						return isAfter(noticeDate, now);
					} else if (statusFilter === "archived") {
						return isBefore(noticeDate, now);
					}
				} catch {
					return false;
				}
				return true;
			});
		}

		// Sort notices
		return filtered.sort((a, b) => {
			if (sortBy === "date") {
				try {
					return new Date(b.noticedate) - new Date(a.noticedate);
				} catch {
					return 0;
				}
			} else if (sortBy === "title") {
				return a.noticetitle.localeCompare(b.noticetitle);
			}
			return 0;
		});
	}, [notices, searchTerm, statusFilter, sortBy]);

	// Export functionality
	const handleExport = () => {
		const csvContent = [
			["Title", "Content", "Date", "Has Image"],
			...filteredNotices.map(n => [
				n.noticetitle,
				n.notice,
				n.noticedate,
				n.noticeimage && n.noticeimage !== "/ghanti.png" ? "Yes" : "No"
			])
		].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `notices_${format(new Date(), "yyyy-MM-dd")}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
		
		toast.success("Notices exported successfully!");
	};

	if (loading) return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
		</div>
	);
	if (error) return <p>Error: {error}</p>;

	const handleEdit = (notice) => {
		setNoticeToEdit(notice);
		setOpenNoticeModal(true);
	};

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`/api/notices/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete notice");
			}
			toast.success("Notice deleted successfully!");
			mutate();
		} catch {
			toast.error("Failed to delete notice. Please try again.");
		}
	};

	const handleCloseNoticeModal = () => {
		setOpenNoticeModal(false);
		setNoticeToEdit(null);
		mutate();
	};

	const handleCreateNotice = () => {
		setNoticeToEdit(null);
		setOpenNoticeModal(true);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Notices Management</h1>
					<p className="text-gray-600 mt-2">Create and manage organizational notices and announcements</p>
				</div>
				<div className="flex gap-3">
					<Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
						<Download className="w-4 h-4" />
						Export CSV
					</Button>
					<Button onClick={handleCreateNotice} className="flex items-center gap-2">
						<Plus className="w-4 h-4" />
						Create Notice
					</Button>
				</div>
			</div>

			{/* Analytics Cards */}
			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Notices</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.total.toLocaleString()}</div>
							<p className="text-xs text-muted-foreground">All time</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.recent30Days}</div>
							<p className="text-xs text-muted-foreground">New notices</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">With Images</CardTitle>
							<ImageIcon className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.withImagesPercentage}%</div>
							<p className="text-xs text-muted-foreground">{analytics.withImages} notices</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.recent7Days}</div>
							<p className="text-xs text-muted-foreground">Last 7 days</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Create/Edit Modal */}
			{openNoticeModal && (
				<Card className="border-2 border-brand">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Bell className="w-5 h-5" />
							{noticeToEdit ? "Edit Notice" : "Create New Notice"}
						</CardTitle>
						<CardDescription>
							{noticeToEdit ? "Update the notice information below." : "Fill in the details to create a new notice."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<NoticeForm handleCloseNoticeModal={handleCloseNoticeModal} noticeToEdit={noticeToEdit} fetchNotices={notices} />
					</CardContent>
				</Card>
			)}

			{/* Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Filter className="w-5 h-5" />
						Filters & Search
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4">
						<div className="flex-1">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search by title or content..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<Select value={statusFilter} onValueChange={setStatusFilter}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Notices</SelectItem>
								<SelectItem value="upcoming">Upcoming</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="date">Sort by Date</SelectItem>
								<SelectItem value="title">Sort by Title</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Notices List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span className="flex items-center gap-2">
							<Bell className="w-5 h-5" />
							Notices List
						</span>
						<Badge variant="secondary">
							{filteredNotices.length} {filteredNotices.length === 1 ? 'notice' : 'notices'}
						</Badge>
					</CardTitle>
					<CardDescription>
						{filteredNotices.length === 0 
							? "No notices found matching your criteria." 
							: `Showing ${filteredNotices.length} of ${notices?.length || 0} total notices`
						}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{filteredNotices.length === 0 ? (
						<div className="text-center py-12">
							<FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No notices found</h3>
							<p className="text-gray-500">
								{searchTerm || statusFilter !== "all" 
									? "Try adjusting your search or filters." 
									: "Create your first notice to get started."}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredNotices.map((notice) => {
								const isUpcoming = (() => {
									try {
										return isAfter(parseISO(notice.noticedate), new Date());
									} catch {
										return false;
									}
								})();
								
								return (
									<div key={notice._id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-3">
													<h3 className="text-lg font-semibold text-gray-900">{notice.noticetitle}</h3>
													{isUpcoming && (
														<Badge variant="default" className="bg-green-100 text-green-800">
															Upcoming
														</Badge>
													)}
													{notice.noticeimage && notice.noticeimage !== "/ghanti.png" && (
														<Badge variant="outline" className="flex items-center gap-1">
															<ImageIcon className="w-3 h-3" />
															Has Image
														</Badge>
													)}
												</div>
												<p className="text-gray-600 mb-3 line-clamp-2">{notice.notice}</p>
												<div className="flex items-center gap-4 text-sm text-gray-500">
													<div className="flex items-center gap-1">
														<Calendar className="w-4 h-4" />
														{format(new Date(notice.noticedate), "MMMM d, yyyy")}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2 ml-4">
												{notice.noticeimage && notice.noticeimage !== "/ghanti.png" && (
													<Image 
														src={notice.noticeimage} 
														width={80} 
														height={80} 
														alt={notice.noticetitle} 
														className="w-16 h-16 rounded-lg object-cover border"
													/>
												)}
												<div className="flex gap-1">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEdit(notice)}
														className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
													>
														<Pencil className="w-4 h-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => setDeleteId(notice._id)}
														className="text-red-600 hover:text-red-700 hover:bg-red-50"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the notice from your database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction 
							onClick={() => handleDelete(deleteId)}
							className="bg-red-600 hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
