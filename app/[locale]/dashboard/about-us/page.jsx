"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Image as ImageIcon, Globe, Users, RefreshCcw } from "lucide-react";
import Image from "next/image";
import AboutUsForm from "@/components/AboutUsForm";
import useFetchData from "@/hooks/useFetchData";

export default function AboutUsPage() {
	const [openFormModal, setOpenFormModal] = useState(false);
	const { data: aboutUsData, error, loading, mutate } = useFetchData("/api/about-us?edit=true", "");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleEdit = () => {
		setOpenFormModal(true);
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">About Us Management</h1>
				<Button onClick={handleEdit} className="flex items-center gap-2">
					<Pencil className="w-4 h-4" />
					Edit Content
				</Button>
			</div>

			{!aboutUsData ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<Globe className="w-16 h-16 text-gray-400 mb-4" />
						<h3 className="text-xl font-semibold text-gray-600 mb-2">No About Us Content</h3>
						<p className="text-gray-500 mb-4">Create your About Us content to get started</p>
						<Button onClick={handleEdit} className="flex items-center gap-2">
							<Pencil className="w-4 h-4" />
							Create Content
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{/* Main Content Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Globe className="w-5 h-5" />
								Main Content
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold text-lg mb-2">Title (English)</h4>
										<p className="text-gray-600">{aboutUsData.title?.en || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Subtitle (English)</h4>
										<p className="text-gray-600">{aboutUsData.subtitle?.en || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Description 1 (English)</h4>
										<p className="text-gray-600 text-sm">{aboutUsData.about_description_1?.en || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Description 2 (English)</h4>
										<p className="text-gray-600 text-sm">{aboutUsData.about_description_2?.en || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Button Text (English)</h4>
										<p className="text-gray-600">{aboutUsData.more_about_us?.en || 'N/A'}</p>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold text-lg mb-2">Title (Norwegian)</h4>
										<p className="text-gray-600">{aboutUsData.title?.no || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Subtitle (Norwegian)</h4>
										<p className="text-gray-600">{aboutUsData.subtitle?.no || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Description 1 (Norwegian)</h4>
										<p className="text-gray-600 text-sm">{aboutUsData.about_description_1?.no || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Description 2 (Norwegian)</h4>
										<p className="text-gray-600 text-sm">{aboutUsData.about_description_2?.no || 'N/A'}</p>
									</div>
									<div>
										<h4 className="font-semibold text-lg mb-2">Button Text (Norwegian)</h4>
										<p className="text-gray-600">{aboutUsData.more_about_us?.no || 'N/A'}</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Image Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<ImageIcon className="w-5 h-5" />
								About Us Image
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
										<Image 
											src={aboutUsData.image || "/pashupatinath.png"} 
											alt="About Us Image" 
											fill 
											sizes="100%" 
											className="object-cover" 
										/>
									</div>
								</div>
								<div className="space-y-4">
									<div>
										<h4 className="font-semibold text-lg mb-2">Image URL</h4>
										<p className="text-gray-600 text-sm break-all">{aboutUsData.image || '/pashupatinath.png'}</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Statistics Card */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="w-5 h-5" />
								Statistics
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								<div className="text-center p-4 bg-orange-50 rounded-lg">
									<Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
									<div className="text-2xl font-bold text-orange-800">{aboutUsData.stats?.active_members || '200+'}</div>
									<p className="text-sm text-orange-600">{aboutUsData.stats?.active_members_label?.en || 'Active Members'}</p>
								</div>
								<div className="text-center p-4 bg-red-50 rounded-lg">
									<RefreshCcw className="w-8 h-8 mx-auto mb-2 text-red-600" />
									<div className="text-2xl font-bold text-red-800">{aboutUsData.stats?.months_active || '6+'}</div>
									<p className="text-sm text-red-600">{aboutUsData.stats?.months_active_label?.en || 'Months Active'}</p>
								</div>
								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<p className="text-sm text-gray-600 mb-2">Active Members (Norwegian)</p>
									<p className="font-medium">{aboutUsData.stats?.active_members_label?.no || 'Aktive Medlemmer'}</p>
								</div>
								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<p className="text-sm text-gray-600 mb-2">Months Active (Norwegian)</p>
									<p className="font-medium">{aboutUsData.stats?.months_active_label?.no || 'Måneder Aktiv'}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Nepali Content Preview */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Globe className="w-5 h-5" />
								Nepali Content Preview
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold text-lg mb-2">Title (Nepali)</h4>
									<p className="text-gray-600">{aboutUsData.title?.ne || 'N/A'}</p>
								</div>
								<div>
									<h4 className="font-semibold text-lg mb-2">Subtitle (Nepali)</h4>
									<p className="text-gray-600">{aboutUsData.subtitle?.ne || 'N/A'}</p>
								</div>
								<div>
									<h4 className="font-semibold text-lg mb-2">Description 1 (Nepali)</h4>
									<p className="text-gray-600 text-sm">{aboutUsData.about_description_1?.ne || 'N/A'}</p>
								</div>
								<div>
									<h4 className="font-semibold text-lg mb-2">Description 2 (Nepali)</h4>
									<p className="text-gray-600 text-sm">{aboutUsData.about_description_2?.ne || 'N/A'}</p>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<h4 className="font-semibold text-lg mb-2">Button Text (Nepali)</h4>
										<p className="text-gray-600">{aboutUsData.more_about_us?.ne || 'N/A'}</p>
									</div>
									<div className="space-y-2">
										<p className="text-sm text-gray-600">Active Members (Nepali)</p>
										<p className="font-medium">{aboutUsData.stats?.active_members_label?.ne || 'सक्रिय सदस्यहरू'}</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{openFormModal && (
				<AboutUsForm
					data={aboutUsData}
					onClose={() => setOpenFormModal(false)}
					onSuccess={() => {
						mutate();
						setOpenFormModal(false);
					}}
				/>
			)}
		</div>
	);
}
