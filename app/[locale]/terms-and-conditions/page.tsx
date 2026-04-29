import Link from "next/link";

export default function TermsAndConditions() {
	return (
		<div className="py-8">
			{/* Header */}
			<header className="">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<h1 className="text-3xl font-bold text-gray-900">Pashupatinath Norway Temple Membership Terms and Conditions</h1>
					<p className="text-sm text-gray-900 mt-2">Membership Agreement</p>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-md p-8 space-y-8">
					{/* Important Notice */}
					<section className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg">
						<h2 className="text-xl font-bold text-red-900 mb-3 uppercase">Important Notice</h2>
						<p className="text-gray-900 leading-relaxed font-medium">BEFORE SUBMITTING YOUR MEMBERSHIP APPLICATION, YOU MUST READ AND AGREE TO THESE TERMS AND CONDITIONS, WHICH GOVERN YOUR MEMBERSHIP WITH PASHUPATINATH NORWAY TEMPLE (ORGANIZATION NUMBER: 926 499 211).</p>
					</section>

					{/* Organization Information */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">About Our Organization</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							Pashupatinath Norway Temple is a registered organization in Norway (registration number: 926 499 211) with the main purpose of preserving and promoting Nepali Hindu religion and culture in Norway. More information about our activities can be found at www.nepalihindu.no.
						</p>
						<p className="text-gray-900 leading-relaxed">
							Becoming a member is completely free of charge. Your membership helps us strengthen our community and continue our cultural and religious activities.
						</p>
					</section>

					{/* Membership Terms */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Membership Terms</h2>
						<div className="space-y-4">
							<TermCard title="Free Membership" description="Membership in Pashupatinath Norway Temple is completely free. No membership fees are required to join or maintain your membership status." />
							
							<TermCard title="Age Requirements" description="Membership forms for children under 15 years of age must be filled out and submitted by their parents or legal guardians." />
							
							<TermCard title="Individual Applications" description="Each person must submit a separate membership application. Parents cannot include their children in their own application form." />
							
							<TermCard title="Accurate Information" description="You must provide accurate, complete, and current information in your membership application. You are responsible for updating your information when it changes." />
							
							<TermCard title="Single Membership" description="You may only hold membership with one religious organization at a time. If you are currently a member of another religious organization, you should cancel that membership before joining ours." />
						</div>
					</section>

					{/* Data Protection and Privacy */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection and Privacy</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							Your personal data will only be used by Pashupatinath Norway Temple for membership administration and communication purposes. We will not share your personal information with third parties without your explicit consent, except as required by law.
						</p>
						<p className="text-gray-900 leading-relaxed">
							You have the right to access, update, or delete your personal information at any time by contacting us or through your member portal. For detailed information about how we handle your data, please refer to our Privacy Policy.
						</p>
					</section>

					{/* Membership Rights and Responsibilities */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Membership Rights and Responsibilities</h2>
						<div className="space-y-4">
							<TermCard title="Participation Rights" description="As a member, you have the right to participate in our religious ceremonies, cultural events, and general meetings." />
							
							<TermCard title="Voting Rights" description="Active members have voting rights in organizational matters as specified in our bylaws and during general meetings." />
							
							<TermCard title="Code of Conduct" description="Members are expected to respect our cultural and religious traditions, maintain respectful behavior towards other members, and support the organization's mission." />
							
							<TermCard title="Communication" description="We will communicate with members primarily through email and our member portal. Please keep your contact information updated to receive important announcements." />
						</div>
					</section>

					{/* Membership Cancellation */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Membership Cancellation</h2>
						<p className="text-gray-900 leading-relaxed mb-4">
							You may cancel your membership at any time by sending a written request to our organization. We will process your cancellation within 48 hours and confirm the completion of the process.
						</p>
						<p className="text-gray-900 leading-relaxed">
							To cancel your membership, please email us at norwaynepalihindutemple@gmail.com with your full name, personal number, and a clear statement that you wish to cancel your membership.
						</p>
					</section>

					{/* Terms Modification */}
					<section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
						<h2 className="text-xl font-semibold text-gray-900 mb-3">Terms Modification</h2>
						<p className="text-gray-900 leading-relaxed">We may update these terms and conditions from time to time. Any changes will be communicated to members through email and posted on our website. Continued membership after such changes constitutes acceptance of the modified terms.</p>
					</section>

					{/* Contact Information */}
					<section className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-6 rounded-r-lg">
						<h2 className="text-xl font-bold text-green-900 mb-3">Contact Information</h2>
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
							<Link href="/en/privacy-policy" className="inline-flex items-center px-4 py-2 bg-brand_primary text-gray-700 rounded-lg hover:scale-105 transition-all">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Privacy Policy
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
					<p className="mt-1">By submitting a membership application, you agree to these Terms and Conditions</p>
				</div>
			</footer>
		</div>
	);
}

function TermCard({ title, description }: { title: string; description: string }) {
	return (
		<div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-100">
			<div className="flex items-start">
				<div className="flex-shrink-0 mr-3">
					<svg className="w-6 h-6 text-indigo-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
					</svg>
				</div>
				<div>
					<h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
					<p className="text-gray-900 text-sm leading-relaxed">{description}</p>
				</div>
			</div>
		</div>
	);
}
