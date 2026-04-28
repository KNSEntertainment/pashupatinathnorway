"use client";
import { useState, useMemo } from "react";
import useFetchData from "@/hooks/useFetchData";
import { format, subDays, isAfter, isBefore, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trash2, 
  Users, 
  Mail, 
  Calendar, 
  TrendingUp, 
  Download, 
  Search, 
  Filter,
  Activity
} from "lucide-react";
import toast from "react-hot-toast";

export default function SubscribersPage() {
	const [deleteId, setDeleteId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [timeFilter, setTimeFilter] = useState("all");
	const { data: subscribers, error, loading, mutate } = useFetchData("/api/subscribers", "subscribers");

	// Calculate analytics
	const analytics = useMemo(() => {
		if (!subscribers) return null;
		
		const now = new Date();
		const last30Days = subDays(now, 30);
		const last7Days = subDays(now, 7);
		const today = startOfDay(now);

		const totalSubscribers = subscribers.length;
		const recent30Days = subscribers.filter(s => isAfter(new Date(s.createdAt), last30Days)).length;
		const recent7Days = subscribers.filter(s => isAfter(new Date(s.createdAt), last7Days)).length;
		const todaySubscribers = subscribers.filter(s => isAfter(new Date(s.createdAt), today)).length;

		// Growth rate
		const previous30Days = subscribers.filter(s => 
			isBefore(new Date(s.createdAt), last30Days) && 
			isAfter(new Date(s.createdAt), subDays(last30Days, 30))
		).length;
		const growthRate = previous30Days > 0 ? ((recent30Days - previous30Days) / previous30Days * 100).toFixed(1) : 0;

		return {
			total: totalSubscribers,
			recent30Days,
			recent7Days,
			todaySubscribers,
			growthRate: parseFloat(growthRate),
			averagePerDay: (recent30Days / 30).toFixed(1)
		};
	}, [subscribers]);

	// Filter subscribers
	const filteredSubscribers = useMemo(() => {
		if (!subscribers) return [];
		
		let filtered = subscribers;

		// Apply time filter
		const now = new Date();
		if (timeFilter === "7days") {
			filtered = filtered.filter(s => isAfter(new Date(s.createdAt), subDays(now, 7)));
		} else if (timeFilter === "30days") {
			filtered = filtered.filter(s => isAfter(new Date(s.createdAt), subDays(now, 30)));
		}

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(s => 
				s.subscriber.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}, [subscribers, searchTerm, timeFilter]);

	// Export functionality
	const handleExport = () => {
		const csvContent = [
			["Email", "Subscribed Date"],
			...filteredSubscribers.map(s => [
				s.subscriber,
				format(new Date(s.createdAt), "yyyy-MM-dd HH:mm:ss")
			])
		].map(row => row.join(",")).join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
		
		toast.success("Subscribers exported successfully!");
	};

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`/api/subscribers/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete subscriber");
			}
			toast.success("Subscriber deleted successfully!");
			mutate();
		} catch (error) {
			toast.error("Failed to delete subscriber. Please try again.", error);
		}
	};

	if (loading) return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
		</div>
	);
	if (error) return <p>Error: {error}</p>;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
					<p className="text-gray-600 mt-2">Manage your newsletter subscribers and track growth</p>
				</div>
				<Button onClick={handleExport} className="flex items-center gap-2">
					<Download className="w-4 h-4" />
					Export CSV
				</Button>
			</div>

			{/* Analytics Cards */}
			{analytics && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
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
							<p className="text-xs text-muted-foreground">New subscribers</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{analytics.growthRate > 0 ? '+' : ''}{analytics.growthRate}%
							</div>
							<p className="text-xs text-muted-foreground">vs previous 30 days</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Daily Average</CardTitle>
							<Activity className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{analytics.averagePerDay}</div>
							<p className="text-xs text-muted-foreground">Subscribers per day</p>
						</CardContent>
					</Card>
				</div>
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
									placeholder="Search by email..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>
						<Select value={timeFilter} onValueChange={setTimeFilter}>
							<SelectTrigger className="w-full md:w-48">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Time</SelectItem>
								<SelectItem value="30days">Last 30 Days</SelectItem>
								<SelectItem value="7days">Last 7 Days</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Subscribers List */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span className="flex items-center gap-2">
							<Mail className="w-5 h-5" />
							Subscribers List
						</span>
						<Badge variant="secondary">
							{filteredSubscribers.length} {filteredSubscribers.length === 1 ? 'subscriber' : 'subscribers'}
						</Badge>
					</CardTitle>
					<CardDescription>
						{filteredSubscribers.length === 0 
							? "No subscribers found matching your criteria." 
							: `Showing ${filteredSubscribers.length} of ${subscribers?.length || 0} total subscribers`
						}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{filteredSubscribers.length === 0 ? (
						<div className="text-center py-12">
							<Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers found</h3>
							<p className="text-gray-500">
								{searchTerm || timeFilter !== "all" 
									? "Try adjusting your search or filters." 
									: "No subscribers have signed up yet."}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{filteredSubscribers.map((subscriber) => (
								<div key={subscriber._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
									<div className="flex items-center space-x-4">
										<div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
											<Mail className="w-5 h-5 text-brand" />
										</div>
										<div>
											<p className="font-medium text-gray-900">{subscriber.subscriber}</p>
											<p className="text-sm text-gray-500 flex items-center gap-1">
												<Calendar className="w-3 h-3" />
												Joined {format(new Date(subscriber.createdAt), "MMM d, yyyy")}
											</p>
										</div>
									</div>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setDeleteId(subscriber._id)}
										className="text-red-600 hover:text-red-700 hover:bg-red-50"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							))}
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
							This action cannot be undone. This will permanently delete the subscriber from your database.
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
