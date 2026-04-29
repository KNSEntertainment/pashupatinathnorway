import Link from "next/link";

export default function PrivacyPolicy() {
	return (
		<div className="py-8">
			{/* Header */}
			<header className="">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<h1 className="text-3xl font-bold text-gray-900">Pashupatinath Norway Temple Membership Privacy Policy</h1>
					<p className="text-sm text-gray-900 mt-2">Last Updated: December 2025</p>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-md p-8 space-y-8">
					{/* Introduction */}
					<section>
						<p className="text-gray-900 leading-relaxed">
							This Privacy Policy explains how Pashupatinath Norway Temple (Organization Number: 926 499 211) collects, uses, and protects your personal information when you apply for membership or interact with our organization. We are committed to protecting your privacy and ensuring transparency in our data handling practices.
						</p>
					</section>

					{/* Information We Collect */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							When you apply for membership or interact with our organization, we collect the following information:
						</p>

						<div className="space-y-3">
							<DataItem title="Personal Information" description="First name, middle name, last name, date of birth, and gender" />
							<DataItem title="Contact Information" description="Email address, phone number, and residential addresses in Norway and Nepal" />
							<DataItem title="Identification" description="Personal number (personnummer) and other identification details" />
							<DataItem title="Family Information" description="Parents' names, spouse's name, and children's information" />
							<DataItem title="Professional Information" description="Education, occupation, and professional details" />
							<DataItem title="Membership Details" description="Membership application date, status, and participation in activities" />
						</div>
					</section>

					{/* How We Use Your Information */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							We use your personal information only for the following purposes:
						</p>

						<div className="space-y-3">
							<DataUseItem type="Membership Administration" purpose="To process and manage your membership application and maintain accurate membership records" />
							<DataUseItem type="Communication" purpose="To send important announcements, event invitations, and organizational updates via email or phone" />
							<DataUseItem type="Event Organization" purpose="To organize religious ceremonies, cultural events, and community activities" />
							<DataUseItem type="Legal Compliance" purpose="To comply with Norwegian laws and regulations regarding religious organizations" />
							<DataUseItem type="Community Building" purpose="To connect members and foster a sense of community within our organization" />
						</div>
					</section>

					{/* Data Protection and Security */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection and Security</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							We implement appropriate technical and organizational measures to protect your personal information:
						</p>
						<div className="bg-blue-50 rounded-lg p-4 space-y-2">
							<div className="flex items-start">
								<span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
								<span className="text-gray-900">Secure storage of personal data with limited access</span>
							</div>
							<div className="flex items-start">
								<span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
								<span className="text-gray-900">Regular security updates and monitoring</span>
							</div>
							<div className="flex items-start">
								<span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
								<span className="text-gray-900">Staff training on data protection best practices</span>
							</div>
							<div className="flex items-start">
								<span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
								<span className="text-gray-900">Compliance with GDPR and Norwegian data protection laws</span>
							</div>
						</div>
					</section>

					{/* Data Sharing */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							We do not sell, rent, or share your personal information with third parties for marketing purposes. Your information may only be shared in the following circumstances:
						</p>
						<div className="space-y-3">
							<DataUseItem type="Legal Requirements" purpose="When required by Norwegian law, court order, or government authorities" />
							<DataUseItem type="Organizational Purpose" purpose="With other members for community building and event organization (with your consent)" />
							<DataUseItem type="Service Providers" purpose="With trusted third-party service providers who assist in membership administration" />
						</div>
					</section>

					{/* Your Rights */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							As a member, you have the following rights regarding your personal information:
						</p>
						<div className="space-y-3">
							<RightsCard title="Access" description="You can request a copy of all personal information we hold about you" />
							<RightsCard title="Correction" description="You can request correction of inaccurate or incomplete information" />
							<RightsCard title="Deletion" description="You can request deletion of your personal information when you cancel membership" />
							<RightsCard title="Portability" description="You can request your data in a machine-readable format" />
							<RightsCard title="Objection" description="You can object to certain uses of your personal information" />
						</div>
					</section>

					{/* Data Retention */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							We retain your personal information only as long as necessary for the purposes outlined in this policy:
						</p>
						<div className="bg-light rounded-lg p-4 space-y-2">
							<div className="flex items-start">
								<span className="font-semibold text-gray-900 mr-2">•</span>
								<span className="text-gray-900">Active members: Information retained throughout membership period</span>
							</div>
							<div className="flex items-start">
								<span className="font-semibold text-gray-900 mr-2">•</span>
								<span className="text-gray-900">Cancelled membership: Information deleted within 48 hours of request</span>
							</div>
							<div className="flex items-start">
								<span className="font-semibold text-gray-900 mr-2">•</span>
								<span className="text-gray-900">Legal requirements: Some information may be retained longer if required by law</span>
							</div>
						</div>
					</section>

					{/* Children's Privacy */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Children&apos;s Privacy</h2>
						<p className="text-gray-900 leading-relaxed">
							For children under 15 years of age, membership applications must be submitted by parents or legal guardians. We only collect minimal necessary information about children and ensure their privacy is protected in accordance with applicable laws.
						</p>
					</section>

					{/* Policy Updates */}
					<section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
						<h2 className="text-xl font-semibold text-gray-900 mb-3">Policy Updates</h2>
						<p className="text-gray-900 leading-relaxed">
							We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Any significant changes will be communicated to members via email and posted on our website at least 30 days before taking effect.
						</p>
					</section>

					{/* Contact Information */}
					<section className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-r-lg">
						<h2 className="text-xl font-bold text-green-900 mb-3">Contact Information</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							If you have any questions about this Privacy Policy or wish to exercise your rights regarding your personal information, please contact us:
						</p>
						<div className="space-y-2">
							<p className="text-gray-900"><strong>Email:</strong> norwaynepalihindutemple@gmail.com</p>
							<p className="text-gray-900"><strong>Website:</strong> www.nepalihindu.no</p>
							<p className="text-gray-900"><strong>Organization Number:</strong> 926 499 211</p>
						</div>
					</section>

					{/* Related Documents */}
					<section className="border-t border-gray-200 pt-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
						<div className="flex flex-wrap gap-3">
							<Link href="/en/terms-and-conditions" className="inline-flex items-center px-4 py-2 bg-brand_primary text-gray-700 rounded-lg hover:scale-105 transition-all">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Terms and Conditions
							</Link>
							<Link href="/en/membership" className="inline-flex items-center px-4 py-2 bg-neutral-600 text-white rounded-lg  hover:scale-105 transition-all">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								Membership Application
							</Link>
						</div>
					</section>
				</div>
			</main>

			{/* Footer */}
			<footer className="bg-white border-t border-gray-200 mt-12">
				<div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-900 text-sm">
					<p>© 2025 Pashupatinath Norway Temple. All rights reserved.</p>
					<p className="mt-1">Organization Number: 926 499 211</p>
					<p className="mt-1">This Privacy Policy is effective as of December 2025</p>
				</div>
			</footer>
		</div>
	);
}

function DataItem({ title, description }: { title: string; description: string }) {
	return (
		<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
			<h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
			<p className="text-gray-900 text-sm leading-relaxed">{description}</p>
		</div>
	);
}

function DataUseItem({ type, purpose }: { type: string; purpose: string }) {
	return (
		<div className="flex items-start">
			<span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
			<p className="text-gray-900">
				<span className="font-semibold text-gray-900">{type}</span> - {purpose}
			</p>
		</div>
	);
}

function RightsCard({ title, description }: { title: string; description: string }) {
	return (
		<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
			<h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
			<p className="text-gray-900 text-sm leading-relaxed">{description}</p>
		</div>
	);
}
