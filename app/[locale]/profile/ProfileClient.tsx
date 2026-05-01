"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { User, Mail, Phone, Calendar, Shield, CheckCircle, Clock, XCircle, Users, Camera, Upload, AlertCircle, Download, Trash2, MailMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Image from "next/image";
import { Membership } from "@/types";

interface Translations {
	title: string;
	personalInfo: string;
	fullName: string;
	email: string;
	phone: string;
	username: string;
	memberSince: string;
	accountType: string;
	admin: string;
	member: string;
	logout: string;
	editProfile: string;
	membershipDetails: string;
	membershipStatus: string;
	membershipType: string;
	approved: string;
	pending: string;
	blocked: string;
	general: string;
	active: string;
	loading: string;
}

interface Props {
	translations: Translations;
}

export default function ProfileClient({ translations: t }: Props) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [membershipData, setMembershipData] = useState<Membership | null>(null);
	const [loading, setLoading] = useState(true);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
	const [isUnsubscribing, setIsUnsubscribing] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
	const [isSubscribing, setIsSubscribing] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [profilePhoto, setProfilePhoto] = useState<string>("");
	const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
	const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);
	const [showSizeAlert, setShowSizeAlert] = useState(false);
	const [alertFileInfo, setAlertFileInfo] = useState<{ name: string; size: number } | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { toast } = useToast();

	const handleDeleteAccount = async () => {
		setIsDeleting(true);
		try {
			const response = await fetch('/api/user/delete-account', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: session?.user?.email,
				}),
			});

			if (response.ok) {
				// Send notification email
				await fetch('/api/email/account-deletion-notification', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email: session?.user?.email,
						fullName: session?.user?.fullName,
					}),
				});

				toast({
					title: "Account Deleted",
					description: "Your account has been permanently deleted. You will be redirected to the home page.",
				});
				
				// Sign out and redirect to home
				setTimeout(() => {
					signOut({ callbackUrl: "/" });
				}, 2000);
			} else {
				throw new Error('Failed to delete account');
			}
		} catch (error) {
			console.error('Delete account error:', error);
			toast({
				title: "Error",
				description: "Failed to delete account. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsDeleting(false);
			setShowDeleteDialog(false);
		}
	};

	const handleDownloadData = async () => {
		setIsDownloading(true);
		try {
			const response = await fetch('/api/user/download-data', {
				method: 'GET',
			});

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
				a.download = `my-data_${timestamp}.csv`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);

				toast({
					title: "Success",
					description: "Your data has been downloaded successfully.",
				});
			} else {
				throw new Error('Failed to download data');
			}
		} catch (error) {
			console.error('Download data error:', error);
			toast({
				title: "Error",
				description: "Failed to download your data. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsDownloading(false);
		}
	};

	const handleUnsubscribe = async () => {
		setIsUnsubscribing(true);
		try {
			const response = await fetch('/api/user/unsubscribe', {
				method: 'POST',
			});

			if (response.ok) {
				const data = await response.json();
				setIsSubscribed(false);
				toast({
					title: "Unsubscribed",
					description: data.message,
				});
			} else {
				throw new Error('Failed to unsubscribe');
			}
		} catch (error) {
			console.error('Unsubscribe error:', error);
			toast({
				title: "Error",
				description: "Failed to unsubscribe from newsletter. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsUnsubscribing(false);
			setShowUnsubscribeDialog(false);
		}
	};

	const handleSubscribe = async () => {
		setIsSubscribing(true);
		try {
			const response = await fetch('/api/user/subscribe', {
				method: 'POST',
			});

			if (response.ok) {
				const data = await response.json();
				setIsSubscribed(true);
				toast({
					title: "Subscribed",
					description: data.message,
				});
			} else {
				throw new Error('Failed to subscribe');
			}
		} catch (error) {
			console.error('Subscribe error:', error);
			toast({
				title: "Error",
				description: "Failed to subscribe to newsletter. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubscribing(false);
		}
	};

	const checkSubscriptionStatus = async () => {
		try {
			const response = await fetch('/api/user/unsubscribe', {
				method: 'GET',
			});

			if (response.ok) {
				const data = await response.json();
				setIsSubscribed(data.isSubscribed);
			}
		} catch (error) {
			console.error('Error checking subscription status:', error);
		}
	};



	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/en/login");
			return;
		}

		// Redirect admins to dashboard
		if (session?.user?.role === "admin") {
			router.push("/en/dashboard");
			return;
		}

		// Fetch membership data including profile photo
		if (session?.user?.email) {
			fetch(`/api/membership?email=${encodeURIComponent(session.user.email)}`)
				.then((res) => res.json())
				.then((data) => {
					if (Array.isArray(data) && data.length > 0) {
						setMembershipData(data[0]);
						// Set profile photo from membership data
						if (data[0].profilePhoto) {
							setProfilePhoto(data[0].profilePhoto);
						}
					}
					setLoading(false);
				})
				.catch(() => setLoading(false));

			// Check subscription status
			checkSubscriptionStatus();
		} else {
			setLoading(false);
		}

		// Fallback timeout to ensure loading state resolves even if API hangs
		const loadingTimeout = setTimeout(() => {
			setLoading(false);
		}, 5000); // 5 second timeout

		return () => clearTimeout(loadingTimeout);
	}, [status, session?.user?.email, session?.user?.role, router]);

	const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		console.log("File selected:", { name: file.name, size: file.size, type: file.type });

		// Store file info for display
		setSelectedFileName(file.name);
		setSelectedFileSize(file.size);

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast({
				title: "Invalid File",
				description: "Please select an image file (JPG, PNG, etc.)",
				variant: "destructive",
			});
			setSelectedFileName(null);
			setSelectedFileSize(null);
			return;
		}

		// Validate file size (300KB)
		const maxSize = 300 * 1024; // 300KB
		if (file.size > maxSize) {
			const fileSizeKB = Math.round(file.size / 1024);
			setAlertFileInfo({ name: file.name, size: fileSizeKB });
			setShowSizeAlert(true);
			setSelectedFileName(null);
			setSelectedFileSize(null);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
			return;
		}

		setUploading(true);
		console.log("Starting upload...");

		try {
			const formData = new FormData();
			formData.append("photo", file);

			console.log("Sending request to /api/users/profile-photo");
			const response = await fetch("/api/users/profile-photo", {
				method: "POST",
				body: formData,
			});

			console.log("Response status:", response.status);
			const data = await response.json();
			console.log("Response data:", data);

			if (!response.ok) {
				throw new Error(data.error || "Failed to upload photo");
			}

			setProfilePhoto(data.profilePhoto);

			// Clear file selection info
			setSelectedFileName(null);
			setSelectedFileSize(null);

			// Refresh membership data
			if (session?.user?.email) {
				const membershipResponse = await fetch(`/api/membership?email=${encodeURIComponent(session.user.email)}`);
				const membershipData = await membershipResponse.json();
				if (Array.isArray(membershipData) && membershipData.length > 0) {
					setMembershipData(membershipData[0]);
				}
			}

			// Session will be updated automatically on next request
			toast({
				title: "Success",
				description: "Profile photo updated successfully",
			});
		} catch (error: unknown) {
			console.error("Upload error:", error);
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to upload photo",
				variant: "destructive",
			});
		} finally {
			setUploading(false);
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "approved":
				return (
					<Badge className="bg-success text-white">
						<CheckCircle className="w-3 h-3 mr-1" />
						{t.approved}
					</Badge>
				);
			case "blocked":
				return (
					<Badge className="bg-red-500 text-white">
						<XCircle className="w-3 h-3 mr-1" />
						{t.blocked}
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-yellow-500 text-white">
						<Clock className="w-3 h-3 mr-1" />
						{t.pending}
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	const formatDate = (date: string) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
			<div className="max-w-3xl space-y-6">
			<div className="mb-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Profile Card */}
					<Card className="md:col-span-1 shadow-lg border-0">
						<CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
							<div className="flex flex-col items-center">
								<div className="relative w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 group">
									{profilePhoto ? <Image src={profilePhoto} alt="Profile" width={96} height={96} className="w-24 h-24 rounded-full object-cover" /> : <User className="w-12 h-12 text-white" />}
									<button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed">
										{uploading ? <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div> : <Camera className="w-6 h-6 text-white" />}
									</button>
									<input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
								</div>
								<CardTitle className="text-center text-xl">{session?.user?.fullName}</CardTitle>
								<Badge variant="secondary" className="mt-2">
									<Shield className="w-3 h-3 mr-1" />
									{session.user.role === "admin" ? t.admin : t.member}
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="pt-6 space-y-3">
							<Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="outline" className="w-full">
								<Upload className="w-4 h-4 mr-2" />
								{uploading ? "Uploading..." : "Upload Photo"}
							</Button>
						
							<div className="text-xs text-gray-900 text-center space-y-1">
								<p>Maximum file size: 300KB</p>
								{selectedFileName && selectedFileSize && (
									<p className="text-brand_primary font-medium">
										Selected: {selectedFileName} ({Math.round(selectedFileSize / 1024)}KB)
									</p>
								)}
							</div>
					
						</CardContent>
					</Card>

					{/* Personal Information */}
					<Card className="md:col-span-2 shadow-lg border-0">
						<CardHeader>
							<CardTitle className="flex items-center text-2xl">
								<User className="w-6 h-6 mr-2 text-brand_primary" />
								{t.personalInfo}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							


								<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-900 flex items-center">
										<Mail className="w-4 h-4 mr-2" />
										{t.email}
									</label>
									<p className="text-gray-900 text-lg">{session?.user?.email}</p>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-900 flex items-center">
										<Phone className="w-4 h-4 mr-2" />
										{t.phone}
									</label>
									<p className="text-gray-900 text-lg">{session?.user?.phone || "N/A"}</p>
								</div>

							
								<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-900 flex items-center">
										<Calendar className="w-4 h-4 mr-2" />
										Address in Norway
									</label>
									<p className="text-gray-900 text-lg">{membershipData?.address + ", " + membershipData?.city + " " + membershipData?.postalCode || "N/A"}</p>
								</div>
							

						
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Membership Details */}
				{membershipData && (
					<Card className="mt-6 shadow-lg border-0">
						<CardHeader>
							<CardTitle className="flex items-center text-2xl">
								<Users className="w-6 h-6 mr-2 text-purple-600" />
								{t.membershipDetails}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-900">{t.membershipStatus}</label>
									<div>{getStatusBadge(membershipData.membershipStatus)}</div>
								</div>

	<div className="space-y-2">
									<label className="text-sm font-semibold text-gray-900 flex items-center">
										<Calendar className="w-4 h-4 mr-2" />
										{t.memberSince}
									</label>
									<p className="text-gray-900 text-lg">{membershipData ? formatDate(membershipData.createdAt) : "N/A"}</p>
								</div>


							

							</div>
						</CardContent>
					</Card>
				)}

				{/* Data Management */}
				<Card className="mt-6 shadow-lg border-0">
					<CardHeader>
						<CardTitle className="flex items-center text-2xl">
							<Download className="w-6 h-6 mr-2 text-blue-600" />
							Data Management
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
								<div className="flex-1">
									<h3 className="font-semibold text-gray-900 mb-1">Download Your Data</h3>
									<p className="text-sm text-gray-600">Export all your personal data in CSV format</p>
								</div>
								<Button 
									onClick={handleDownloadData}
									disabled={isDownloading}
									variant="outline"
									className="flex items-center gap-2"
								>
									<Download className="w-4 h-4" />
									{isDownloading ? "Downloading..." : "Download CSV"}
								</Button>
							</div>

							<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
								<div className="flex-1">
									<h3 className="font-semibold text-gray-900 mb-1">Email Subscription</h3>
									<p className="text-sm text-gray-600">
										{isSubscribed === null ? "Checking..." : 
										 isSubscribed ? "You are subscribed to our newsletter" : 
										 "You are not subscribed to our newsletter"}
									</p>
								</div>
								{isSubscribed ? (
									<Button 
										onClick={() => setShowUnsubscribeDialog(true)}
										disabled={isUnsubscribing}
										variant="outline"
										className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
									>
										<MailMinus className="w-4 h-4" />
										{isUnsubscribing ? "Unsubscribing..." : "Unsubscribe"}
									</Button>
								) : (
									<Button 
										onClick={handleSubscribe}
										disabled={isSubscribing || isSubscribed === null}
										variant="outline"
										className="flex items-center gap-2 text-green-600 hover:text-green-700"
									>
										<Mail className="w-4 h-4" />
										{isSubscribing ? "Subscribing..." : "Subscribe"}
									</Button>
								)}
							</div>

							<div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
								<div className="flex-1">
									<h3 className="font-semibold text-red-600 mb-1">Delete Account</h3>
									<p className="text-sm text-red-600">Permanently delete your account and all data</p>
								</div>
								<Button 
									onClick={() => setShowDeleteDialog(true)}
									disabled={isDeleting}
									variant="destructive"
									className="flex items-center gap-2"
								>
									<Trash2 className="w-4 h-4" />
									{isDeleting ? "Deleting..." : "Delete Account"}
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

			</div>

			{/* File Size Alert Dialog */}
			<AlertDialog open={showSizeAlert} onOpenChange={setShowSizeAlert}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-red-600">
							<AlertCircle className="w-5 h-5" />
							File Too Large
						</AlertDialogTitle>
						<AlertDialogDescription className="space-y-3 pt-2 text-base">
							<div>
								{alertFileInfo && (
									<>
										<div>
											The selected file <span className="font-semibold text-gray-900">{alertFileInfo.name}</span> is <span className="font-bold text-red-600">{alertFileInfo.size}KB</span>.
										</div>
										<div>
											Maximum allowed size is <span className="font-bold text-success">300KB</span>.
										</div>
										<div className="bg-brand_primary/10 border border-brand0 rounded-lg p-3 mt-2">
											<div className="text-sm font-semibold text-blue-900 mb-1">💡 How to reduce file size:</div>
											<ul className="text-sm text-brand_primary space-y-1 ml-4 list-disc">
												<li>
													You may use free online tool{" "}
													<strong>
														<a href="https://tinypng.com">TinyPNG</a>
													</strong>
												</li>
												<li>Convert to JPG format for smaller file size</li>
											</ul>
										</div>
									</>
								)}
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => setShowSizeAlert(false)}>Got it</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Delete Account Confirmation Dialog */}
			<AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-red-600">Delete Account</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete your account? This action is <strong>permanent and cannot be undone</strong>. 
							All your data, including profile information, membership details, and activity history will be permanently removed from our database.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							onClick={() => setShowDeleteDialog(false)}
							variant="outline"
							className="mr-2"
							disabled={isDeleting}
						>
							Cancel
						</Button>
						<Button
							onClick={handleDeleteAccount}
							className="bg-red-600 hover:bg-red-700 text-white"
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting..." : "Delete Forever"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Unsubscribe Confirmation Dialog */}
			<AlertDialog open={showUnsubscribeDialog} onOpenChange={setShowUnsubscribeDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="text-orange-600">Unsubscribe from Newsletter</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to unsubscribe from our newsletter? 
							You will no longer receive email updates about events, news, and announcements.
							You can always subscribe again later through the contact form.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<Button
							onClick={() => setShowUnsubscribeDialog(false)}
							variant="outline"
							className="mr-2"
							disabled={isUnsubscribing}
						>
							Cancel
						</Button>
						<Button
							onClick={handleUnsubscribe}
							className="bg-orange-600 hover:bg-orange-700 text-white"
							disabled={isUnsubscribing}
						>
							{isUnsubscribing ? "Unsubscribing..." : "Unsubscribe"}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
