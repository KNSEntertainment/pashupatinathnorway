import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, User, Briefcase, Heart, MapPin, Building } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MemberDetailsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
	const { id, locale } = await params;

	try {
		await connectDB();
		
		// Try to find as regular member first
		let member = await Membership.findById(id).lean();
		let isExecutiveMember = false;
		
		// If not found as regular member, try as executive member
		if (!member) {
			member = await ExecutiveMember.findById(id).lean();
			isExecutiveMember = true;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (!member || (!isExecutiveMember && (member as any).membershipStatus !== "approved")) {
			notFound();
		}

		// Type assertion for better TypeScript support
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const memberData = member as any;

		// Permission checking - only for regular members (not executive members)
		const showPhoto = isExecutiveMember || memberData.permissionPhotos;
		const showEmail = isExecutiveMember || memberData.permissionEmail;
		const showPhone = isExecutiveMember || memberData.permissionPhone;

		return (
			<div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto">
					{/* Back Button */}
					<div className="mb-8">
						<Link href={`/${locale}/members`}>
							<Button variant="outline" className="mb-4">
								&larr; Back to Members
							</Button>
						</Link>
					</div>

					{/* Member Card */}
					<Card className="overflow-hidden shadow-2xl">
						{/* Header with Background */}
						<div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600">
							<div className="absolute inset-0 bg-black opacity-20"></div>
							<div className="relative z-10 flex items-end h-full p-6">
								<div className="flex items-center space-x-4">
									{showPhoto && (isExecutiveMember ? memberData.imageUrl : memberData.profilePhoto) ? (
										<div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
											<Image
												src={isExecutiveMember ? memberData.imageUrl : memberData.profilePhoto}
												alt={isExecutiveMember ? memberData.name : memberData.fullName}
												fill
												className="object-cover"
											/>
										</div>
									) : (
										<div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg">
											<span className="text-2xl font-bold text-gray-600">
												{(isExecutiveMember ? memberData.name : memberData.fullName)?.charAt(0)?.toUpperCase() || 'U'}
											</span>
										</div>
									)}
									<div className="text-white">
										<h1 className="text-3xl font-bold">{isExecutiveMember ? memberData.name : memberData.fullName}</h1>
										<p className="text-blue-100">
											{isExecutiveMember ? 
												(memberData.position || "Executive Member") : 
												(`${memberData.membershipType.charAt(0).toUpperCase() + memberData.membershipType.slice(1)} Member`)
											}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Content */}
						<CardContent className="p-6">
							<div className="grid md:grid-cols-2 gap-8">
								{/* Left Column - Personal Information */}
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
											<User className="w-5 h-5 mr-2" />
											Personal Information
										</h3>
										<div className="space-y-3">
											{showEmail && (
												<div className="flex items-center space-x-3">
													<Mail className="w-4 h-4 text-gray-400" />
													<span className="text-gray-700">{isExecutiveMember ? memberData.email : memberData.email}</span>
												</div>
											)}
											{showPhone && (isExecutiveMember ? memberData.phone : memberData.phone) && (
												<div className="flex items-center space-x-3">
													<Phone className="w-4 h-4 text-gray-400" />
													<span className="text-gray-700">{isExecutiveMember ? memberData.phone : memberData.phone}</span>
												</div>
											)}
											<div className="flex items-center space-x-3">
												<Calendar className="w-4 h-4 text-gray-400" />
												<span className="text-gray-700">
													Member since {new Date(memberData.createdAt).toLocaleDateString()}
												</span>
											</div>
											{(!isExecutiveMember && memberData.address) && (
												<div className="flex items-center space-x-3">
													<MapPin className="w-4 h-4 text-gray-400" />
													<span className="text-gray-700">{memberData.address}</span>
												</div>
											)}
										</div>
									</div>

									{(!isExecutiveMember && memberData.skills) && (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
												<Briefcase className="w-5 h-5 mr-2" />
												Skills & Expertise
											</h3>
											<p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{memberData.skills}</p>
										</div>
									)}
								</div>

								{/* Right Column - Membership Information */}
								<div className="space-y-6">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
											{isExecutiveMember ? <Building className="w-5 h-5 mr-2" /> : <Heart className="w-5 h-5 mr-2" />}
											{isExecutiveMember ? "Executive Details" : "Membership Details"}
										</h3>
										<div className="space-y-3">
											{isExecutiveMember ? (
												<>
													<div className="flex items-center justify-between">
														<span className="text-gray-600">Position:</span>
														<span className="text-gray-900 font-medium">{memberData.position || "Executive Member"}</span>
													</div>
													{memberData.department && (
														<div className="flex items-center justify-between">
															<span className="text-gray-600">Department:</span>
															<span className="text-gray-900 font-medium">{memberData.department}</span>
														</div>
													)}
													{memberData.subdepartment && (
														<div className="flex items-center justify-between">
															<span className="text-gray-600">Sub-department:</span>
															<span className="text-gray-900 font-medium">{memberData.subdepartment}</span>
														</div>
													)}
												</>
											) : (
												<>
													<div className="flex items-center justify-between">
														<span className="text-gray-600">Membership Type:</span>
														<Badge variant={memberData.membershipType === "active" ? "default" : "secondary"}>
															{memberData.membershipType.charAt(0).toUpperCase() + memberData.membershipType.slice(1)}
														</Badge>
													</div>
													<div className="flex items-center justify-between">
														<span className="text-gray-600">Status:</span>
														<Badge variant="outline" className="text-green-600 border-green-600">
															{memberData.membershipStatus.charAt(0).toUpperCase() + memberData.membershipStatus.slice(1)}
														</Badge>
													</div>
													{memberData.nationalMembershipNo && (
														<div className="flex items-center justify-between">
															<span className="text-gray-600">National Membership No:</span>
															<span className="text-gray-900 font-medium">{memberData.nationalMembershipNo}</span>
														</div>
													)}
												</>
											)}
										</div>
									</div>

									{(!isExecutiveMember && memberData.volunteerInterest && memberData.volunteerInterest.length > 0) && (
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
												<Heart className="w-5 h-5 mr-2" />
												Volunteer Interests
											</h3>
											<div className="flex flex-wrap gap-2">
												{memberData.volunteerInterest.map((interest: string, index: number) => (
													<Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
														{interest}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	} catch (error) {
		console.error("Error fetching member details:", error);
		notFound();
	}
}
