"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

import Image from "next/image";

interface MemberIDCardProps {
	memberData: {
		_id: string;
		fullName: string;
		email: string;
		phone?: string;
		profilePhoto?: string;
		nationalMembershipNo?: string;
		membershipType: string;
		city?: string;
		personalNumber?: string;
		membershipId?: string;
		createdAt: string;
	};
	logo?: string;
	locale?: string;
}

export default function MemberIDCard({ memberData }: MemberIDCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	
	// Cache-busting key to prevent Safari caching issues
	const cacheKey = `${memberData._id}-${memberData.createdAt}-${Date.now()}`;

	// Generate membership number from last 6 digits of _id
	const membershipNumber = memberData._id.slice(-6).toUpperCase();

	// QR code now only contains the member ID
	const qrData = memberData.membershipId || membershipNumber;


	// Format membership date
	const membershipDate = new Date(memberData.createdAt).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	return (
		<div id="print-cards-container" className="flex flex-col items-center mt-6 space-y-8" key={cacheKey}>
		

			{/* ID Card - Front */}
			<div ref={cardRef} className="relative" style={{ width: '300px', height: '475px' }}>
				{/* Card Container */}
				<div className="w-full h-full bg-white shadow-lg overflow-hidden">
					{/* Header Section */}
					<div className="relative bg-brand_primary text-gray-100 px-6 pt-4 pb-8">
						<div className="flex flex-col items-center justify-between">
								<h2 className="text-md font-bold mt-0.5 text-gray-700">Pashupatinath Norway Temple</h2>
								<h3 className="text-sm font-semibold text-gray-700">Oslo, Norway</h3>
								<h4 className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-brand_secondary shadow-md px-2 py-1 rounded-2xl text-xs font-semibold tracking-wide text-gray-100">MEMBERSHIP CARD</h4>
						</div>
					
					</div>

					{/* Content Section */}
					<div className="p-6">
						{/* Membership Number - TOP LEFT */}
						{/* <div className="text-xs text-center font-light text-gray-600">
								#<span className="font-semibold">{membershipNumber}</span>
							</div> */}
						<div className="w-full flex justify-center my-1">
							<div className="w-24 h-24 rounded-md overflow-hidden bg-light border-2 border-white shadow-md">
							
								{memberData.profilePhoto ? (
									<Image src={memberData.profilePhoto} alt={memberData.fullName} width={80} height={80} className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand/20 to-brand/10">
										<span className="text-2xl font-bold text-brand_primary">{memberData.fullName.charAt(0)}</span>
									</div>
								)}
							</div>
							
						</div>
					</div>
					<div className="relative grid grid-cols-1 ml-8 gap-2">
							{/* Member ID */}
							<div>
								<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Member ID</p>
								<p className="text-sm font-bold text-brand_primary">{memberData.membershipId || membershipNumber}</p>
							</div>
							{/* Name */}
							<div>
								<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Full Name</p>
								<p className="text-sm font-bold text-gray-900 truncate">{memberData.fullName}</p>
							</div>

							{/* Address */}
							<div>
								{memberData.city && (
									<div>
										<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Address</p>
										<p className="text-xs font-semibold text-gray-900">{memberData.city}</p>
									</div>
								)}
							</div>

								{/* Contact Information */}
							<div className="space-y-1">
								{memberData.phone && (
									<div>
										<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Contact</p>
										<p className="text-xs font-semibold text-gray-900">{memberData.phone}</p>
									</div>
								)}
							</div>
								{/* Issued date Information */}
							<div className="space-y-1">
								{membershipDate && (
									<div>
										<p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Issued on</p>
										<p className="text-xs font-semibold text-gray-900">{membershipDate}</p>
									</div>
								)}
							</div>
						</div>
					
						{/* QR Code with Signature */}
						<div className="absolute bottom-16 right-12 flex flex-col items-center">
								<QRCodeSVG value={qrData} size={108} level="H" includeMargin={false} />
							{/* Signature below QR */}
							<div className="my-2 text-center">
								{/* <div className="w-16 h-8 mx-auto flex items-center justify-center">
									<Image src="/signature.png" alt="President's Signature" className="w-full h-full object-contain" width={64} height={32} />
								</div> */}
							</div>
						</div>

					{/* Footer Section with Contact Info */}
					<div className="absolute bottom-0 w-full bg-brand_secondary px-6 py-4">
								
								<div className="flex justify-center items-center">
									<p className="text-xs text-gray-100">http://pashupatinathnorway.vercel.app/</p>
								</div>
					</div>
				</div>
			</div>

			{/* ID Card - Back */}
			<div className="relative block" style={{ width: '300px', height: '475px' }}>
				{/* Card Container */}
				<div className="w-full h-full bg-white shadow-lg overflow-hidden">
					{/* Header Section */}
					<div className="bg-gradient-to-r from-brand to-blue-700 text-gray-700 px-6 pt-6">
						<h3 className="text-sm font-bold text-center">Emergency Contact & Guidelines</h3>
					</div>

					

					{/* Main Content */}
					<Image src="/pashupatinath.png" alt="Pashupatinath Norway Temple Logo" width={144} height={144} className="w-36 h-36 object-contain mx-auto" />
					<div className="px-6 space-y-6">
						
						{/* Emergency Contact */}
						<div>
							<p className="text-xs font-bold text-gray-900 mb-2">Emergency Contact</p>
							{memberData.email && (
								<div className="flex items-center gap-2">
									<span className="text-[10px] font-semibold text-gray-500">Email:</span>
									<span className="text-[10px] text-gray-900">{memberData.email}</span>
								</div>
							)}
							{memberData.phone && (
								<div className="flex items-center gap-2 mt-1">
									<span className="text-[10px] font-semibold text-gray-500">Phone:</span>
									<span className="text-[10px] text-gray-900">{memberData.phone}</span>
								</div>
							)}
						</div>

						{/* Guidelines */}
						<div>
							<p className="text-xs font-bold text-gray-900 mb-2">Member Guidelines</p>
							<ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
								<li>This card is non-transferable</li>
								<li>Report lost or stolen cards immediately</li>
								<li>Valid for active memberships only</li>
							</ul>
						</div>

						{/* Organization Info */}
						<div className="border-t border-light pt-3">
							<p className="text-[10px] font-bold text-brand_primary mb-1">Pashupatinath Norway Temple</p>
							<p className="text-[9px] text-gray-600 mt-1">Org. No.926499211</p>
						</div>
					</div>

					{/* Footer Section */}
					<div className="absolute bottom-0 w-full bg-brand_secondary px-6 py-4">
						
							<div className="flex justify-center items-center">
									<p className="text-xs text-gray-100">nepalihindusamfunn@gmail.com</p>
								</div>
							
					</div>
				</div>
			</div>

			{/* Print Styles */}
			<style jsx global>{`
				@media print {
					body * {
						visibility: hidden;
					}
					#print-cards-container,
					#print-cards-container * {
						visibility: visible;
					}
					#print-cards-container {
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						display: flex !important;
						justify-content: center !important;
						align-items: flex-start !important;
						padding: 20px !important;
						gap: 40px !important;
					}
					#print-cards-container > div {
						page-break-inside: avoid;
					}
					@page {
						size: A4;
						margin: 10mm;
					}
				}
			`}</style>
		</div>
	);
}
