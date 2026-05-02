"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Mail, MailMinus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Membership } from "@/types";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


export default function DataManagement() {
        const router = useRouter();
        const { data: session, status } = useSession();
        const [, setMembershipData] = useState<Membership | null>(null);
        const [, setProfilePhoto] = useState<string | null>(null);
        const [, setLoading] = useState(true);
    
        const [isDownloading, setIsDownloading] = useState(false);
        const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
        const [isSubscribing, setIsSubscribing] = useState(false);
        const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
        const [isUnsubscribing, setIsUnsubscribing] = useState(false);
        	const [isDeleting, setIsDeleting] = useState(false);
            	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
	}, [status, session?.user?.email, router, session?.user?.role]); 

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

            const checkSubscriptionStatus = useCallback(async () => {
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
            }, []);
    return (
         <>
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
           </>
    );
}