"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const opportunitiesData = [
	{
		id: "community-organizer",
		title: "Community Organizer",
		shortDescription: "Lead local initiatives and bring Nepalis together in your city",
		icon: "🎪",
		color: "bg-blue-500",
		gradient: "from-blue-400 to-blue-600",
		fullDescription: "As a Community Organizer, you'll be at the forefront of building strong local networks of Nepalis in Norway. You'll create meaningful connections, organize impactful events, and ensure RSP's vision reaches every corner of the Norwegian Nepali community.",
		responsibilities: ["Organize and coordinate local community events, meetups, and cultural programs", "Build and maintain relationships with local Nepali organizations and community leaders", "Recruit new members and volunteers for PNSB-Norway", "Represent RSP values and principles at community gatherings", "Coordinate with the national team on local campaign initiatives", "Create monthly reports on community engagement activities"],
		requirements: ["Strong interpersonal and communication skills", "Experience in event planning or community organizing (preferred)", "Passion for Nepali politics and social change", "Ability to commit 5-10 hours per week", "Fluency in Nepali and English/Norwegian"],
		benefits: ["Leadership development opportunities", "Network with influential community members", "Access to RSP national events and training", "Certificate of recognition for your service", "Direct impact on community building"],
		timeCommitment: "5-10 hours per week",
		location: "Your local city in Norway",
		contact: "info@pnsbnorway.org",
	},
	{
		id: "digital-activist",
		title: "Digital Activist",
		shortDescription: "Amplify our message through social media and online campaigns",
		icon: "📱",
		color: "bg-brand",
		gradient: "from-purple-400 to-purple-600",
		fullDescription: "Digital Activists are the voice of RSP in the online world. You'll craft compelling narratives, engage with our community on social media, and help build RSP's digital presence across platforms. Your creativity and digital savvy will help us reach thousands.",
		responsibilities: ["Create and schedule engaging social media content across platforms", "Monitor and respond to comments and messages on social channels", "Design graphics and videos for online campaigns", "Track social media analytics and optimize content strategy", "Participate in online activism campaigns and trending discussions", "Collaborate with the communications team on digital strategy"],
		requirements: ["Strong social media skills (Facebook, Instagram, Twitter, TikTok)", "Creative content creation abilities", "Understanding of digital marketing trends", "Basic graphic design or video editing skills (preferred)", "Available for 8-12 hours per week", "Excellent written communication in English and Nepali"],
		benefits: ["Build your digital portfolio", "Learn advanced social media strategies", "Certificate in digital activism", "Networking with digital professionals", "Amplify your voice on important issues"],
		timeCommitment: "8-12 hours per week",
		location: "Remote (anywhere in Norway)",
		contact: "info@pnsbnorway.org",
	},
	{
		id: "policy-contributor",
		title: "Policy Contributor",
		shortDescription: "Help shape RSP's policies and strategic direction",
		icon: "📋",
		color: "bg-indigo-500",
		gradient: "from-indigo-400 to-indigo-600",
		fullDescription: "Policy Contributors are the intellectual backbone of RSP. You'll research critical issues facing Nepal, contribute to policy discussions, and help develop evidence-based positions on key matters. Your expertise will directly influence RSP's policy platform.",
		responsibilities: ["Research and analyze policy issues relevant to Nepal and diaspora", "Draft policy briefs and position papers", "Participate in policy discussion forums and working groups", "Provide expert insights in your area of specialization", "Review and provide feedback on proposed policies", "Present findings to the policy committee"],
		requirements: ["Background in public policy, economics, law, or related fields", "Strong research and analytical skills", "Excellent writing abilities", "Critical thinking and objectivity", "Available for 6-10 hours per week", "Graduate degree preferred but not required"],
		benefits: ["Shape national policies", "Work with policy experts", "Access to research resources", "Published work recognition", "Policy development experience"],
		timeCommitment: "6-10 hours per week",
		location: "Remote (anywhere in Norway)",
		contact: "info@pnsbnorway.org",
	},
	{
		id: "fundraising-team",
		title: "Fundraising Team",
		shortDescription: "Support our mission through creative fundraising initiatives",
		icon: "💰",
		color: "bg-success",
		gradient: "from-green-400 to-green-600",
		fullDescription: "Fundraising Team members ensure RSP has the resources to achieve its mission. You'll develop creative fundraising campaigns, build relationships with donors, and organize events that generate support for our cause while engaging the community.",
		responsibilities: ["Plan and execute fundraising events and campaigns", "Identify and cultivate relationships with potential donors", "Create compelling fundraising materials and appeals", "Manage donor databases and maintain records", "Thank and recognize donors appropriately", "Collaborate with finance team on budget planning"],
		requirements: ["Experience in fundraising or sales (preferred)", "Excellent interpersonal and persuasion skills", "Creative thinking and event planning abilities", "Detail-oriented with good organizational skills", "Available for 8-15 hours per week", "Understanding of non-profit fundraising principles"],
		benefits: ["Fundraising expertise development", "Network with business leaders", "Event management experience", "Recognition for campaign success", "Direct impact on RSP's capacity"],
		timeCommitment: "8-15 hours per week",
		location: "Hybrid (mix of remote and in-person)",
		contact: "info@pnsbnorway.org",
	},
	{
		id: "youth-ambassador",
		title: "Youth Ambassador",
		shortDescription: "Engage young Nepalis and drive youth participation",
		icon: "🎓",
		color: "bg-brand",
		gradient: "from-orange-400 to-orange-600",
		fullDescription: "Youth Ambassadors are the bridge between RSP and Nepal's future leaders. You'll engage with young Nepalis in Norway, organize campus activities, and ensure youth voices are heard in party decisions. Your energy will inspire the next generation.",
		responsibilities: ["Organize youth-focused events, workshops, and discussions", "Build networks with student organizations and youth groups", "Recruit young members and volunteers", "Advocate for youth issues within RSP", "Manage youth social media channels", "Mentor younger members and new volunteers"],
		requirements: ["Age 18-35 (flexible)", "Active in student or youth communities", "Passionate about youth empowerment", "Strong communication and leadership skills", "Available for 6-10 hours per week", "Creative and energetic personality"],
		benefits: ["Leadership training programs", "Scholarship opportunities", "Youth conference attendance", "Mentorship from senior leaders", "Build youth movement experience"],
		timeCommitment: "6-10 hours per week",
		location: "Campus-based or local community",
		contact: "info@pnsbnorway.org",
	},
	{
		id: "creative-team",
		title: "Creative Team",
		shortDescription: "Design visual content and creative materials",
		icon: "🎨",
		color: "bg-pink-500",
		gradient: "from-pink-400 to-pink-600",
		fullDescription: "Creative Team members bring RSP's message to life through stunning visuals. You'll design graphics, create videos, and develop creative materials that capture attention and inspire action. Your artistic vision will shape how people see RSP.",
		responsibilities: ["Design graphics for social media, events, and campaigns", "Create and edit videos for digital platforms", "Develop branding materials and visual guidelines", "Design posters, banners, and promotional materials", "Collaborate with other teams on creative needs", "Maintain RSP's visual identity consistency"],
		requirements: ["Proficiency in design tools (Photoshop, Illustrator, Canva, etc.)", "Video editing skills (Premiere, Final Cut, or similar)", "Strong portfolio of creative work", "Understanding of branding and visual identity", "Available for 5-10 hours per week", "Eye for aesthetics and current design trends"],
		benefits: ["Build professional portfolio", "Access to design software licenses", "Recognition for creative work", "Networking with creative professionals", "Creative freedom and expression"],
		timeCommitment: "5-10 hours per week",
		location: "Remote (anywhere in Norway)",
		contact: "info@pnsbnorway.org",
	},
];

function OpportunitiesPageInner() {
	const searchParams = useSearchParams();
	const idFromQuery = searchParams.get("id") || "community-organizer";
	const [selectedId, setSelectedId] = useState(idFromQuery);

	// Keep selectedId in sync with query param
	useEffect(() => {
		if (idFromQuery !== selectedId) {
			setSelectedId(idFromQuery);
		}
	}, [idFromQuery, selectedId]);

	const selectedOpportunity = opportunitiesData.find((opp) => opp.id === selectedId) || opportunitiesData[0];
	const otherOpportunities = opportunitiesData.filter((opp) => opp.id !== selectedId);

	return (
		<div className=" bg-gradient-to-br from-neutral-50 to-blue-50">
			{/* Breadcrumb */}
			<div className="bg-white border-b border-light">
				<div className="max-w-7xl mx-auto px-4 py-4">
					<div className="flex items-center text-sm text-gray-900">
						<Link href="/" className="hover:text-brand">
							Home
						</Link>
						<svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
						<Link href="/get-involved" className="hover:text-brand">
							Get Involved
						</Link>
						<svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
						</svg>
						<span className="text-gray-900 font-medium">{selectedOpportunity.title}</span>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content Area - 2 columns */}
					<div className="lg:col-span-2">
						<MainContent opportunity={selectedOpportunity} />
					</div>

					{/* Sidebar - 1 column */}
					<div className="lg:col-span-1">
						<Sidebar opportunities={otherOpportunities} onSelect={setSelectedId} />
					</div>
				</div>
			</div>
		</div>
	);
}

const OpportunitiesPage = () => (
	<Suspense>
		<OpportunitiesPageInner />
	</Suspense>
);

type Opportunity = {
	id: string;
	title: string;
	shortDescription: string;
	icon: string;
	color: string;
	gradient: string;
	fullDescription: string;
	responsibilities: string[];
	requirements: string[];
	benefits: string[];
	timeCommitment: string;
	location: string;
	contact: string;
};

function MainContent({ opportunity }: { opportunity: Opportunity }) {
	const [showApplyForm, setShowApplyForm] = useState(false);

	return (
		<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
			{/* Header */}
			<div className={`bg-gradient-to-r ${opportunity.gradient} p-8 text-white`}>
				<div className="flex items-center mb-4">
					<div className="text-6xl mr-4">{opportunity.icon}</div>
					<div>
						<h1 className="text-4xl font-bold mb-2">{opportunity.title}</h1>
						<p className="text-xl text-white/90">{opportunity.shortDescription}</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-8">
				{/* Overview */}
				<section className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
					<p className="text-gray-900 leading-relaxed text-lg">{opportunity.fullDescription}</p>
				</section>

				{/* Key Information Cards */}
				<div className="grid md:grid-cols-3 gap-4 mb-8">
					<InfoCard icon="⏰" label="Time Commitment" value={opportunity.timeCommitment} />
					<InfoCard icon="📍" label="Location" value={opportunity.location} />
					<InfoCard icon="📧" label="Contact" value={opportunity.contact} />
				</div>

				{/* Responsibilities */}
				<section className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
						<span className="text-3xl mr-3">📌</span>
						Key Responsibilities
					</h2>
					<ul className="space-y-3">
						{opportunity.responsibilities.map((resp: string, idx: number) => (
							<li key={idx} className="flex items-start">
								<svg className="w-6 h-6 text-success0 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								<span className="text-gray-900">{resp}</span>
							</li>
						))}
					</ul>
				</section>

				{/* Requirements */}
				<section className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
						<span className="text-3xl mr-3">✅</span>
						Requirements
					</h2>
					<ul className="space-y-3">
						{opportunity.requirements.map((req: string, idx: number) => (
							<li key={idx} className="flex items-start">
								<svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
								</svg>
								<span className="text-gray-900">{req}</span>
							</li>
						))}
					</ul>
				</section>

				{/* Benefits */}
				<section className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
						<span className="text-3xl mr-3">🎁</span>
						What You&apos;ll Gain
					</h2>
					<div className="grid md:grid-cols-2 gap-4">
						{opportunity.benefits.map((benefit: string, idx: number) => (
							<div key={idx} className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
								<svg className="w-5 h-5 text-brand mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
									<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
								</svg>
								<span className="text-gray-900 font-medium">{benefit}</span>
							</div>
						))}
					</div>
				</section>

				{/* Apply Section */}
				<section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center">
					<h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
					<p className="text-xl text-blue-100 mb-6">Join us in building a better Nepal. Your skills and passion can create real change.</p>
					<div className="flex flex-wrap justify-center gap-4">
						<button onClick={() => setShowApplyForm(!showApplyForm)} className="px-8 py-4 bg-white text-brand rounded-full font-bold text-lg hover:bg-brand/10 transition-all transform hover:scale-105 shadow-lg">
							Apply Now
						</button>
						<a href={`mailto:${opportunity.contact}`} className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-brand transition-all transform hover:scale-105">
							Ask Questions
						</a>
					</div>
				</section>

				{/* Quick Apply Form */}
				{showApplyForm && (
					<div className="mt-8 p-8 bg-light rounded-xl border-2 border-blue-200">
						<h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Application</h3>
						<QuickApplyForm opportunity={opportunity} />
					</div>
				)}
			</div>
		</div>
	);
}

function Sidebar({ opportunities, onSelect }: { opportunities: Opportunity[]; onSelect: (id: string) => void }) {
	return (
		<div className="space-y-4 sticky top-4">
			<div className="bg-white rounded-2xl shadow-lg p-6">
				<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
					<svg className="w-6 h-6 mr-2 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
					</svg>
					Other Opportunities
				</h3>
				<div className="space-y-3">
					{opportunities.map((opp) => (
						<OpportunityCard key={opp.id} opportunity={opp} onClick={() => onSelect(opp.id)} />
					))}
				</div>
			</div>

			{/* Help Box */}
			<div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
				<h3 className="text-lg font-bold mb-3">Need Help Choosing?</h3>
				<p className="text-blue-100 text-sm mb-4">Not sure which role fits you best? We&apos;re here to help!</p>
				<Link href="/contact" className="block w-full bg-white text-brand text-center py-3 rounded-lg font-semibold hover:bg-brand/10 transition-colors">
					Contact Us
				</Link>
			</div>
		</div>
	);
}

function OpportunityCard({ opportunity, onClick }: { opportunity: Opportunity; onClick: () => void }) {
	return (
		<div onClick={onClick} className="group cursor-pointer p-4 rounded-xl border-2 border-light hover:border-blue-500 hover:shadow-lg transition-all bg-white">
			<div className="flex items-start">
				<div className={`${opportunity.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform`}>{opportunity.icon}</div>
				<div className="ml-3 flex-1">
					<h4 className="font-bold text-gray-900 group-hover:text-brand transition-colors mb-1">{opportunity.title}</h4>
					<p className="text-sm text-gray-900 line-clamp-2">{opportunity.shortDescription}</p>
				</div>
				<svg className="w-5 h-5 text-gray-900 group-hover:text-brand group-hover:translate-x-1 transition-all ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
				</svg>
			</div>
		</div>
	);
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
	return (
		<div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-light">
			<div className="text-3xl mb-2">{icon}</div>
			<div className="text-sm text-gray-900 mb-1">{label}</div>
			<div className="font-semibold text-gray-900">{value}</div>
		</div>
	);
}

function QuickApplyForm({ opportunity }: { opportunity: Opportunity }) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});

	const handleSubmit = () => {
		console.log("Application submitted for:", opportunity.title, formData);
		alert("Thank you for your application! We will contact you soon.");
	};

	return (
		<div className="space-y-4">
			<input type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border-2 border-light rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
			<input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border-2 border-light rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
			<input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-light rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
			<textarea placeholder="Why are you interested in this role? (Optional)" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={4} className="w-full px-4 py-3 border-2 border-light rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
			<button onClick={handleSubmit} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105">
				Submit Application
			</button>
		</div>
	);
}
export default OpportunitiesPage;
