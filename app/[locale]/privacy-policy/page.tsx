import Link from "next/link";

export default function PrivacyPolicy() {
	return (
		<div className="py-8">
			{/* Header */}
			<header className="">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<h1 className="text-3xl font-bold text-gray-900">RSP Web/App Privacy Policy</h1>
					<p className="text-sm text-gray-900 mt-2">Last Updated: December 2025</p>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-4xl mx-auto px-4 py-8">
				<div className="bg-white rounded-lg shadow-md p-8 space-y-8">
					{/* Introduction */}
					<section>
						<p className="text-gray-900 leading-relaxed">This Privacy Policy will help you understand what data we collect, why we collect it and what we do with it. By downloading this app you understand and accept the contents of this privacy policy and its subsequent versions. We appreciate & acknowledge the informed consent granted by you while downloading the App, using its features and/or submitting your information within the App.</p>
					</section>

					{/* Collection */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Collection</h2>
						<p className="text-gray-900 leading-relaxed">To provide a tailor made and personalised experience, the information you share maybe processed and analysed by third party services who are engaged by us with due confidentiality obligations and solely for the specific purpose of such services. This will help the App give you the best possible experience by showing content in your language and according to your interests. For example, based on the location data collected, you may get a push notification when RSP is doing event is in your province or district or there is an important initiative or event happening in your location. Similarly, based on your previous interactions within the App you may receive push notifications based on your interests in the future.</p>
					</section>

					{/* Permissions */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Permissions</h2>
						<p className="text-gray-900 leading-relaxed mb-4">The RSP App requests you for several permissions in order to serve you better. All these permissions are contextual and cause-specific. You are also free to grant or deny many of these permissions. Below is a list of permissions requested along with the purpose they serve:</p>

						<div className="space-y-4">
							<PermissionCard title="Identity and Accounts" description="Permission to use your identity and use relevant information from your device to help you use your Social Media to login to the App. You may choose to not grant this permission and enter your identity details independently or choose to browse the App in Guest mode." />
							<PermissionCard title="Contacts" description="Permission to access your contacts is requested to help you connect with your friends to form a community on the New Connect module." />
							<PermissionCard title="Camera and File Storage" description="Permission to access your camera and/or photos/media/files is requested to help you use features like Registration, 'Selfie With Leader', 'Likewise RSP will be conducting various other initiatives where posting a photo may be required to participate. These permissions are also required to enable you to post photos anywhere on the App." />
							<PermissionCard title="Read SMS" description="RSP App has a donation provision whereby people who want to contribute to the party in financial terms. Since the process requires financial transaction to be carried out, permission to access your SMS is used by the Payment Gateway to read OTP sent over SMS to authenticate the transaction. User can choose not to grant this permission." />
							<PermissionCard title="Microphone" description="Permission to access your microphone is requested only to enable you to converse in live video facilities." />
							<PermissionCard title="Phone" description="Permission to access your phone is requested only to enable you to place phone calls to access feedback mechanism, party programmes and services." />
							<PermissionCard title="Wi-Fi/Network Connection/Network Access" description="Permission to access Wi-Fi, Network Connection and Network Access is taken only to allow the App to connect to the internet to provide its functionality." />
							<PermissionCard title="Draw over other apps" description="Permission to draw over other apps is taken only to allow for a modern and contextual user interface that can be showcased outside the App." />
						</div>

						<p className="text-gray-900 leading-relaxed mt-4">Similarly functionality related to Sticky Broadcast, Flashlight, Vibration, Prevent device from sleeping, service configurations and others are used only for purposes of providing reliable and efficient functionality. The permissions asked for are used only for a specific feature or user action. For example, permission to use photos is used only when you want to post a photo and the file storage permission is used only to store the photo on the device.</p>
					</section>

					{/* Use */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Use</h2>
						<p className="text-gray-900 leading-relaxed mb-4">The following information collected by the App is used only for the purposes mentioned below:</p>

						<div className="space-y-3">
							<DataUseItem type="User Photo" purpose="is used to display personalised messaging in comments to articles and registration for the party." />
							<DataUseItem type="Gender" purpose="is used to address you correctly in notifications and other communications" />
							<DataUseItem type="Name" purpose="is used to personalise notifications and communications" />
							<DataUseItem type="Email ID" purpose="is used to send important communications" />
							<DataUseItem type="Location details" purpose="are used to send notifications in your language and to serve you content relevant to your geography" />
							<DataUseItem type="IP Address" purpose="is used as a security feature to log malicious activity, if any" />
							<DataUseItem type="Phone Number" purpose="is used to send special communications from the RSP Team also the number is used in many cases for user authentication." />
							<DataUseItem type="Device information" purpose="is used to create accounts, perform contextual actions, personalised services and provide personalised services." />
							<DataUseItem type="Unique Application numbers, cookies and similar technologies" purpose="are used to identify your device uniquely for contextual services and push notifications." />
						</div>
					</section>

					{/* Transparency and Choice */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Transparency and Choice</h2>
						<p className="text-gray-900 leading-relaxed">You are free to grant or deny the permissions listed above and utilise the App with a subset of the features you choose to avail at any given time. We may update our Privacy Policy from time to time. When we change the policy in a material way, a notice will be posted on our website along with the updated Privacy Policy.</p>
					</section>

					{/* Termination */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination of the use of personal information collected from the user</h2>
						<p className="text-gray-900 leading-relaxed">
							The user may request the deletion of their data by sending an email to{" "}
							<a href="mailto:info@pnsbnorway.org" className="text-brand hover:text-brand underline">
								info@pnsbnorway.org
							</a>{" "}
							and should get a response within 48 hours.
						</p>
					</section>

					{/* Voting Counts */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Voting Counts</h2>
						<p className="text-gray-900 leading-relaxed mb-3">If the votes received between the candidates are equal, the basis for election will be as follows:</p>
						<div className="bg-light rounded-lg p-4 space-y-2">
							<div className="flex items-start">
								<span className="font-semibold text-gray-900 mr-2">1.</span>
								<span className="text-gray-900">First woman on the basis of priority.</span>
							</div>
							<div className="flex items-start">
								<span className="font-semibold text-gray-900 mr-2">2.</span>
								<span className="text-gray-900">The second minority and caste basis are minorities, Dalits, Tharu, Muslims, Madheshi, tribal tribes and Khasarya respectively.</span>
							</div>
							<div className="flex items-start">
								<span className="font-semibold text-gray-900 mr-2">3.</span>
								<span className="text-gray-900">If the above priorities are also repeated, the youth (younger age) will be elected on the basis of priority</span>
							</div>
						</div>
					</section>

					{/* Donations */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">Donations</h2>
						<p className="text-gray-900 leading-relaxed">RSP is a member-based party and your contributions is the bases on which the party operates. Please read the respective terms and conditions of the payment gateways app before donating.</p>
					</section>

					{/* User Safety */}
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">User Safety and Security</h2>
						<p className="text-gray-900 leading-relaxed">We value all personal information provided by you and we shall ensure the safety and security of information you provide in the App. Your data shall not be sold or rented to anyone and will only be utilised for the functionality of the App and related features, services, etc.</p>
					</section>

					{/* Contact */}
					<section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
						<h2 className="text-xl font-semibold text-gray-900 mb-3">Questions or Concerns?</h2>
						<p className="text-gray-900 leading-relaxed">If you have any questions or concerns about our Privacy Policy or data usage, please write to us on the Help & Feedback section of the App.</p>
					</section>

					{/* Additional Resources */}
					<section className="border-t border-light pt-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Related Documents</h3>
						<div className="flex flex-wrap gap-3">
							<Link href="/en/terms-and-conditions" className="inline-flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-blue-700 transition-colors">
								<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Terms and Conditions
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
			{/* <footer className="bg-white border-t border-light mt-12">
				<div className="max-w-4xl mx-auto px-4 py-6 text-center text-gray-900 text-sm">
					<p>© 2025 RSP Nepal. All rights reserved.</p>
				</div>
			</footer> */}
		</div>
	);
}

function PermissionCard({ title, description }: { title: string; description: string }) {
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
				<span className="font-semibold text-gray-900">{type}</span> {purpose}
			</p>
		</div>
	);
}
