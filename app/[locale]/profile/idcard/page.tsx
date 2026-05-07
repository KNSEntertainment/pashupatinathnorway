"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, CreditCard, Loader2, Printer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Membership } from "@/types";
import MemberIDCard from "@/components/MemberIDCard";
import { useParams } from "next/navigation";

export default function IDCardPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const locale = params.locale as string;
    
    const [membershipData, setMembershipData] = useState<Membership | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<string>("");
    const [logo, setLogo] = useState<string>("");
    const lastEmailRef = useRef<string | null>(null);
    const hasFetchedRef = useRef<boolean>(false);

    const handlePrint = () => {
        window.print();
    };

    const fetchMembershipData = useCallback(async () => {
        if (!session?.user?.email) return;
        
        try {
            const response = await fetch(`/api/membership?email=${session.user.email}`);
            if (!response.ok) {
                throw new Error("Failed to fetch membership data");
            }
            const data = await response.json();
            console.log("Fetched membership data:", data);
            console.log("Data type:", typeof data);
            console.log("Is array?", Array.isArray(data));
            
            // Handle case where API returns an array
            let membershipData = data;
            if (Array.isArray(data) && data.length > 0) {
                membershipData = data[0];
                console.log("Extracted from array:", membershipData);
            }
            
            console.log("Final membership data:", membershipData);
            console.log("Membership status:", membershipData.membershipStatus);
            console.log("Status type:", typeof membershipData.membershipStatus);
            console.log("Status comparison:", membershipData.membershipStatus === "approved");
            setMembershipData(membershipData);
        } catch (error) {
            console.error("Error fetching membership data:", error);
        }
    }, [session?.user?.email]);

    const fetchProfilePhoto = useCallback(async () => {
        if (!session?.user?.email) return;
        
        try {
            const response = await fetch(`/api/users/profile-photo?email=${session.user.email}`);
            if (response.ok) {
                const data = await response.json();
                if (data.profilePhoto) {
                    setProfilePhoto(data.profilePhoto);
                }
            }
        } catch (error) {
            console.error("Error fetching profile photo:", error);
        }
    }, [session?.user?.email]);

    const fetchLogo = useCallback(async () => {
        try {
            const response = await fetch(`/api/settings`);
            if (response.ok) {
                const data = await response.json();
                if (data.logo) {
                    setLogo(data.logo);
                }
            }
        } catch (error) {
            console.error("Error fetching logo:", error);
        }
    }, []);

    // Fetch membership data and profile photo when authenticated
    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            const currentEmail = session.user.email;
            
            // Only fetch if email has changed or we haven't fetched yet
            if (lastEmailRef.current === currentEmail && hasFetchedRef.current) {
                return;
            }
            
            const fetchData = async () => {
                await Promise.all([
                    fetchMembershipData(),
                    fetchProfilePhoto(),
                    fetchLogo()
                ]);
                lastEmailRef.current = currentEmail;
                hasFetchedRef.current = true;
            };
            fetchData();
        }
    }, [status, session?.user?.email, fetchMembershipData, fetchProfilePhoto, fetchLogo]);

    if (status === "loading") {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center min-h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-brand_primary" />
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-4xl mx-auto">
                <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        Please log in to view your ID card.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-8 flex gap-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My ID Card</h1>
                <Button onClick={handlePrint} variant="outline" className="border-brand text-brand_secondary hover:bg-brand_secondary/10">
					<Printer className="w-4 h-4" />
					Print
				</Button>
                {/* <p className="text-gray-600">
                </p> */}
            </div>

        

				{/* Member ID Card Section */}
				{membershipData && membershipData.membershipStatus === "approved" && (
					<Card className="">
				
						
							<CardContent id="id-card-container">
								<MemberIDCard
									memberData={{
										_id: membershipData._id || "",
										fullName: session.user.fullName || "",
										email: session.user.email || "",
										phone: membershipData.phone,
										profilePhoto: profilePhoto || undefined,
										membershipType: membershipData.membershipType,
										city: membershipData.city,
										personalNumber: membershipData.personalNumber,
										membershipId: membershipData.membershipId,
										createdAt: membershipData.createdAt,
									}}
									logo={logo}
									locale={locale}
								/>
							</CardContent>
						
					</Card>
				)}

            {/* Show message if membership is not approved */}
            {membershipData && membershipData.membershipStatus !== "approved" && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardContent className="p-6 text-center">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-orange-600" />
                        <h3 className="text-lg font-semibold text-orange-900 mb-2">Membership Not Approved</h3>
                        <p className="text-orange-700">
                            Your membership status is currently: <strong>{membershipData.membershipStatus}</strong>
                        </p>
                        <p className="text-orange-600 text-sm mt-2">
                            ID cards are only available for approved members. Please contact support if you believe this is an error.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Show message if no membership data */}
            {!membershipData && (
                <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="p-6 text-center">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Membership Data Found</h3>
                        <p className="text-gray-600">
                            Unable to load your membership information. Please try refreshing the page or contact support.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
