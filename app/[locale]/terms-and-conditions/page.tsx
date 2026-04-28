import Link from "next/link";

export default function TermsAndConditions() {
	return (
		<div className="py-8">
			{/* Header */}
			<header className="">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<h1 className="text-3xl font-bold text-gray-900">RSP App Terms and Conditions</h1>
					<p className="text-sm text-gray-900 mt-2">Submission Agreement</p>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-md p-8 space-y-8">
					{/* Important Notice */}
					<section className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg">
						<h2 className="text-xl font-bold text-red-900 mb-3 uppercase">Important Notice</h2>
						<p className="text-gray-900 leading-relaxed font-medium">BEFORE SUBMITTING ANY INFORMATION, TEXT, GRAPHICS, VIDEOS, PHOTOS OR OTHER MATERIAL (&quot;CONTENT&quot;) TO THE RSP APP YOU MUST READ AND AGREE TO THE TERMS OF THIS SUBMISSION AGREEMENT, WHICH APPLIES TO ALL CONTENT UPLOADED FROM YOUR ACCOUNT AT ANY TIME.</p>
					</section>

					{/* Submission Agreement */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Submission Agreement</h2>
						<p className="text-gray-900 leading-relaxed">By submitting any content to the RSP App, you hereby agree that you are responsible for any Content that you submit and any consequences thereof.</p>
					</section>

					{/* Content Removal */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Content Removal</h2>
						<p className="text-gray-900 leading-relaxed">You understand that any Content submitted on the RSP App can be removed if we believe that it violates these Terms of Service, our policies or any laws by which we are governed.</p>
					</section>

					{/* User Responsibilities */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Responsibilities</h2>
						<div className="space-y-4">
							<ResponsibilityCard title="Privacy Policy Agreement" description="You further agree that any information that you or other users provide to the RSP APP is subject to our Privacy Policy, which governs our collection and use of information." />

							<ResponsibilityCard title="Copyright and Third-Party Rights" description="You agree not to upload any content that infringes upon or violates copyright, trademark, privacy or any other rights of any third party, and not to attempt to circumvent any content filtering techniques we may employ." />

							<ResponsibilityCard title="Appropriate Content" description="You agree to not post nude, partially nude, or sexually suggestive photos." />

							<ResponsibilityCard title="Account Security" description="You are responsible for any activity that occurs under your screen name. You are responsible for keeping your password secure." />

							<ResponsibilityCard title="User Conduct" description="You must not abuse, harass, threaten, impersonate, or intimidate other users on the app." />

							<ResponsibilityCard title="Content Ownership" description="You are solely responsible for your conduct and any data, text, information, screen names, graphics, photos, profiles, audio and video clips, links, contents that you submit, post, and display on the app." />
						</div>
					</section>

					{/* Terms Modification */}
					<section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
						<h2 className="text-xl font-semibold text-gray-900 mb-3">Terms Modification</h2>
						<p className="text-gray-900 leading-relaxed">We may change or modify these terms, at any time, in our sole discretion.</p>
					</section>

					{/* Disclaimer */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer of Liability</h2>
						<div className="bg-light rounded-lg p-6 border border-light">
							<p className="text-gray-900 leading-relaxed mb-4">You agree and acknowledge that the RSP App is not responsible for and does not control Content submitted and published by a third party.</p>
							<p className="text-gray-900 leading-relaxed">Under no circumstances will the RSP App be liable in any way for any Content, including, but not limited to, any errors or omissions in any Content, or any loss or damage of any kind incurred as a result of the use of any Content posted, emailed, transmitted or otherwise made available via the RSP App or broadcast elsewhere.</p>
						</div>
					</section>

					{/* Termination Warning */}
					<section className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
						<h2 className="text-xl font-bold text-yellow-900 mb-3 uppercase">Termination Policy</h2>
						<p className="text-gray-900 leading-relaxed font-medium">FAILURE TO ADHERE TO THE TERMS OF SERVICE AND PRIVACY POLICY, AMONG OTHERS, MAY RESULT, AMONG OTHER THINGS, IN THE TERMINATION OF YOUR ACCOUNT AND THE DELETION OF CONTENT SUBMITTED FROM YOUR ACCOUNT ON THE RSP APP, WITH OR WITHOUT NOTICE, AS DETERMINED BY THE RSP APP IN ITS SOLE DISCRETION.</p>
					</section>

					{/* Additional Resources */}
					<section className="border-t border-light pt-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
						<div className="flex flex-wrap gap-3">
							<Link href="/en/privacy-policy" className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-blue-700 transition-colors">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Privacy Policy
							</Link>
							<Link href="mailto:info@pnsbnorway.org" className="inline-flex items-center px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								Contact Support
							</Link>
						</div>
					</section>
				</div>
			</main>

			{/* Footer */}
			<footer className="bg-white border-t border-light mt-12">
				<div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-900 text-sm">
					<p>© 2025 RSP Nepal. All rights reserved.</p>
					<p className="mt-1">By using the RSP App, you agree to these Terms and Conditions</p>
				</div>
			</footer>
		</div>
	);
}

function ResponsibilityCard({ title, description }: { title: string; description: string }) {
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
