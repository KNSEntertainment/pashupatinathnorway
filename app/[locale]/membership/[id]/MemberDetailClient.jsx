"use client";
import Image from "next/image";
import { Calendar, Mail, Phone, MapPin, Briefcase, User, IdCard, Heart, CheckCircle, Clock, XCircle, Award, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MemberDetailClient({ member }) {
	if (!member) {
		return (
			<div className="flex items-center justify-center w-full min-h-screen bg-red-50 mt-24">
				<p className="text-lg text-red-600">Member not found.</p>
			</div>
		);
	}

	// Status badge styling
	const getStatusBadge = (status) => {
		const statusConfig = {
			approved: {
				icon: CheckCircle,
				label: "Approved",
				className: "bg-success text-success border-success",
			},
			pending: {
				icon: Clock,
				label: "Pending",
				className: "bg-yellow-100 text-yellow-800 border-yellow-300",
			},
			blocked: {
				icon: XCircle,
				label: "Blocked",
				className: "bg-red-50 text-red-800 border-red-300",
			},
		};

		const config = statusConfig[status] || statusConfig.pending;
		const Icon = config.icon;

		return (
			<Badge className={`${config.className} px-3 py-1 flex items-center gap-2`} variant="outline">
				<Icon size={16} />
				{config.label}
			</Badge>
		);
	};

	// Membership type badge
	const getMembershipTypeBadge = (type) => {
		const typeConfig = {
			active: {
				icon: Award,
				label: "Executive Member",
				className: "bg-blue-100 text-brand border-blue-300",
			},
			general: {
				icon: Users,
				label: "General Member",
				className: "bg-purple-100 text-purple-800 border-purple-300",
			},
		};

		const config = typeConfig[type] || typeConfig.general;
		const Icon = config.icon;

		return (
			<Badge className={`${config.className} px-3 py-1 flex items-center gap-2`} variant="outline">
				<Icon size={16} />
				{config.label}
			</Badge>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
			<div className="container mx-auto max-w-5xl">
				{/* Header Section with Profile */}
				<Card className="mb-8 overflow-hidden shadow-lg">
					<div className="bg-brand h-32 md:h-40"></div>
					<CardContent className="relative px-6 pb-6">
						<div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-16 md:-mt-20">
							{/* Profile Photo */}
							<div className="relative">
								<div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-light">
									{member.profilePhoto ? (
										<Image src={member.profilePhoto} alt={member.fullName} width={160} height={160} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center bg-brand">
											<User size={60} className="text-white" />
										</div>
									)}
								</div>
							</div>

							{/* Name and Status */}
							<div className="flex-1 text-center md:text-left mt-4 md:mt-8">
								<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{member.fullName}</h1>
								<p className="text-lg text-gray-900 mb-4">{member.profession || "PNSB-Norway Member"}</p>
								<div className="flex flex-wrap gap-3 justify-center md:justify-start">
									{getStatusBadge(member.membershipStatus)}
									{getMembershipTypeBadge(member.membershipType)}
								</div>
							</div>

							{/* Join Date */}
							<div className="mt-4 md:mt-8 text-center md:text-right">
								<div className="flex items-center gap-2 text-white">
									<Calendar size={18} />
									<span className="text-sm text-white">Member Since</span>
								</div>
								<p className="text-lg font-semibold text-white mt-1">
									{new Date(member.createdAt).toLocaleDateString("en-US", {
										month: "long",
										year: "numeric",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Information Grid */}
				<div className="grid md:grid-cols-2 gap-6">
					{/* Contact Information */}
					<Card className="shadow-md hover:shadow-lg transition-shadow">
						<CardContent className="p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
								<Mail className="text-brand" size={24} />
								Contact Information
							</h2>
							<div className="space-y-4">
								{member.permissionEmail && (
									<div className="flex items-start gap-3">
										<Mail className="text-gray-900 mt-1 flex-shrink-0" size={20} />
										<div>
											<p className="text-sm text-gray-900">Email</p>
											<a href={`mailto:${member.email}`} className="text-brand hover:underline font-medium">
												{member.email}
											</a>
										</div>
									</div>
								)}
								{member.permissionPhone && (
									<div className="flex items-start gap-3">
										<Phone className="text-gray-900 mt-1 flex-shrink-0" size={20} />
										<div>
											<p className="text-sm text-gray-900">Phone</p>
											<a href={`tel:${member.phone}`} className="text-gray-900 hover:text-brand font-medium">
												{member.phone}
											</a>
										</div>
									</div>
								)}
								{!member.permissionEmail && (
									<div className="flex items-start gap-3">
										<Mail className="text-gray-900 mt-1 flex-shrink-0" size={20} />
										<div>
											<p className="text-sm text-gray-900">Email</p>
											<div className="text-gray-500 font-medium">
												Private (Permission not granted)
											</div>
										</div>
									</div>
								)}
								{!member.permissionPhone && (
									<div className="flex items-start gap-3">
										<Phone className="text-gray-900 mt-1 flex-shrink-0" size={20} />
										<div>
											<p className="text-sm text-gray-900">Phone</p>
											<div className="text-gray-500 font-medium">
												Private (Permission not granted)
											</div>
										</div>
									</div>
								)}
								<div className="flex items-start gap-3">
									<MapPin className="text-gray-900 mt-1 flex-shrink-0" size={20} />
									<div>
										<p className="text-sm text-gray-900">Address</p>
										<p className="text-gray-900 font-medium">{member.address}</p>
										<p className="text-gray-900">
											{member.city}, {member.postalCode}
										</p>
										{member.province && <p className="text-gray-900">{member.province}</p>}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Personal Information */}
					<Card className="shadow-md hover:shadow-lg transition-shadow">
						<CardContent className="p-6">
							<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
								<User className="text-brand" size={24} />
								Personal Information
							</h2>
							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<Calendar className="text-gray-900 mt-1 flex-shrink-0" size={20} />
									<div>
										<p className="text-sm text-gray-900">Date of Birth</p>
										<p className="text-gray-900 font-medium">{member.dateOfBirth}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<User className="text-gray-900 mt-1 flex-shrink-0" size={20} />
									<div>
										<p className="text-sm text-gray-900">Gender</p>
										<p className="text-gray-900 font-medium capitalize">{member.gender}</p>
									</div>
								</div>
								{member.district && (
									<div className="flex items-start gap-3">
										<MapPin className="text-gray-900 mt-1 flex-shrink-0" size={20} />
										<div>
											<p className="text-sm text-gray-900">District</p>
											<p className="text-gray-900 font-medium">{member.district}</p>
										</div>
									</div>
								)}
								{member.profession && (
									<div className="flex items-start gap-3">
										<Briefcase className="text-gray-900 mt-1 flex-shrink-0" size={20} />
										<div>
											<p className="text-sm text-gray-900">Profession</p>
											<p className="text-gray-900 font-medium">{member.profession}</p>
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Membership Details */}
					{(member.nationalMembershipNo || member.skills) && (
						<Card className="shadow-md hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<IdCard className="text-brand" size={24} />
									Membership Details
								</h2>
								<div className="space-y-4">
									{member.nationalMembershipNo && (
										<div className="flex items-start gap-3">
											<IdCard className="text-gray-900 mt-1 flex-shrink-0" size={20} />
											<div>
												<p className="text-sm text-gray-900">National Membership No.</p>
												<p className="text-gray-900 font-mono font-bold text-lg">{member.nationalMembershipNo}</p>
											</div>
										</div>
									)}
									{member.skills && (
										<div className="flex items-start gap-3">
											<Award className="text-gray-900 mt-1 flex-shrink-0" size={20} />
											<div>
												<p className="text-sm text-gray-900">Skills</p>
												<p className="text-gray-900 font-medium">{member.skills}</p>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Volunteer Interests */}
					{member.volunteerInterest && member.volunteerInterest.length > 0 && (
						<Card className="shadow-md hover:shadow-lg transition-shadow">
							<CardContent className="p-6">
								<h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
									<Heart className="text-brand" size={24} />
									Volunteer Interests
								</h2>
								<div className="flex flex-wrap gap-2">
									{member.volunteerInterest.map((interest, index) => (
										<Badge key={index} variant="secondary" className="px-3 py-1 bg-brand/10 text-brand border-brand/20">
											{interest}
										</Badge>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
