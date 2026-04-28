"use client";
import { useState } from "react";

interface FeatureItemProps {
	icon: string;
	title: string;
	description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
	return (
		<div className="flex items-start">
			<div className="text-xl md:text-2xl mr-4">{icon}</div>
			<div>
				<h4 className="font-semibold text-md mb-1">{title}</h4>
				<p className="text-blue-100 text-sm">{description}</p>
			</div>
		</div>
	);
}

interface Translations {
	title: string;
	volunteerDesc: string;
	flexibleCommitment: string;
	flexibleCommitmentDesc: string;
	skillDevelopment: string;
	skillDevelopmentDesc: string;
	makeRealImpact: string;
	makeRealImpactDesc: string;
	trainingProvided: string;
	trainingProvidedDesc: string;
	fullName: string;
	fullName_ph: string;
	email: string;
	phone: string;
	areasOfInterest: string;
	events: string;
	socialMedia: string;
	fundraising: string;
	outreach: string;
	research: string;
	design: string;
	submitApplication: string;
}

interface Props {
	translations: Translations;
	locale: string;
}

interface FormData {
	name: string;
	email: string;
	phone: string;
	interests: string[];
}

export default function VolunteerFormClient({ translations: tr }: Props) {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		phone: "",
		interests: [],
	});

	const interests = [tr.events, tr.socialMedia, tr.fundraising, tr.outreach, tr.research, tr.design];

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		// Validate form
		if (!formData.name || !formData.email || formData.interests.length === 0) {
			alert("Please fill in all required fields and select at least one area of interest.");
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			alert("Please enter a valid email address.");
			return;
		}

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/volunteers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (response.ok) {
				alert("Thank you for your interest! We will contact you soon.");
				// Reset form
				setFormData({
					name: "",
					email: "",
					phone: "",
					interests: [],
				});
			} else {
				alert(data.error || "Failed to submit application. Please try again.");
			}
		} catch (error) {
			console.error("Error submitting volunteer form:", error);
			alert("Failed to submit application. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="md:bg-light md:py-20 py-6">
			<div className="max-w-6xl mx-auto px-4">
				<div className="bg-white rounded-xl md:shadow-md overflow-hidden">
					<div className="grid md:grid-cols-2">
						{/* Left Side - Info */}
						<div className="bg-brand_primary p-8 md:py-12 text-white">
							<h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-6">{tr.title}</h2>
							<p className="text-blue-100 md:mb-8 text-lg">{tr.volunteerDesc}</p>

							<div className="hidden md:block space-y-6">
								<FeatureItem icon="🎯" title={tr.flexibleCommitment} description={tr.flexibleCommitmentDesc} />
								<FeatureItem icon="🤝" title={tr.skillDevelopment} description={tr.skillDevelopmentDesc} />
								<FeatureItem icon="🌟" title={tr.makeRealImpact} description={tr.makeRealImpactDesc} />
								<FeatureItem icon="🎓" title={tr.trainingProvided} description={tr.trainingProvidedDesc} />
							</div>
						</div>

						{/* Right Side - Form */}
						<div className="p-4 md:p-12">
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-semibold text-gray-900 mb-3">{tr.fullName}</label>
									<input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-light rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder={tr.fullName_ph} />
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-900 mb-3">{tr.email}</label>
									<input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-light rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder={tr.email} />
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-900 mb-3">{tr.phone}</label>
									<input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-light rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" placeholder="+47 XXX XX XXX" />
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-900 mb-3">{tr.areasOfInterest}</label>
									<div className="grid grid-cols-2 gap-2">
										{interests.map((interest) => (
											<label key={interest} className="flex items-center p-3 border-2 border-light rounded-lg cursor-pointer hover:border-blue-500 hover:bg-brand_primary/10 transition-all">
												<input
													type="checkbox"
													checked={formData.interests.includes(interest)}
													onChange={(e) => {
														if (e.target.checked) {
															setFormData({ ...formData, interests: [...formData.interests, interest] });
														} else {
															setFormData({ ...formData, interests: formData.interests.filter((i) => i !== interest) });
														}
													}}
													className="w-4 h-4 text-brand_primary rounded"
												/>
												<span className="ml-2 text-sm font-medium text-gray-900">{interest}</span>
											</label>
										))}
									</div>
								</div>

								<button 
									onClick={handleSubmit} 
									disabled={isSubmitting}
									className="w-full bg-brand_primary text-white py-2 md:py-4 rounded-xl font-bold text-lg hover:bg-brand_primary/80 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								>
									{isSubmitting ? "Submitting..." : tr.submitApplication}
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
