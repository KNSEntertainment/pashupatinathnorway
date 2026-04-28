import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
	return (
		<section className="relative min-h-[90vh] overflow-hidden">
			<div className="lg:px-8 py-12 relative z-10">
				<div className="grid lg:grid-cols-2 gap-12 items-center">
					{/* Left Content */}
					<div className="space-y-8 text-center lg:text-left">
						{/* Eyebrow Text */}
						<div className="inline-block">
							<span className="inline-block px-4 py-2 bg-brand_primary/10 text-brand_primary rounded-full text-sm font-semibold tracking-wide uppercase">Best Destinations Around The World</span>
						</div>

						{/* Main Heading */}
						<h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
							<span className="block">It is your</span>
							<span className="block bg-gradient-to-r from-brand to-blue-600 bg-clip-text text-transparent">We will help you</span>
						</h1>

						{/* Description */}
						<p className="text-gray-900 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">Dedicated to making travel as simple as possible, we help each and every one of our clients to find the best options for flights, hotels and car hires to book the perfect trip.</p>

						{/* CTA Button */}
						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<Link href="/explore" className="inline-flex items-center justify-center px-8 py-4 bg-brand_primary text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-brand_primary/90 transform hover:-translate-y-1 transition-all duration-300">
								Let us Explore
								<svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</Link>
							<Link href="/about" className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg border-2 border-light hover:border-brand hover:text-brand_primary transform hover:-translate-y-1 transition-all duration-300">
								Learn More
							</Link>
						</div>

						{/* Stats */}
						<div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8">
							<div>
								<p className="text-3xl md:text-4xl font-bold text-gray-900">500+</p>
								<p className="text-gray-900 text-sm">Happy Members</p>
							</div>
							<div className="h-12 w-px bg-light" />
							<div>
								<p className="text-3xl md:text-4xl font-bold text-gray-900">50+</p>
								<p className="text-gray-900 text-sm">Events Hosted</p>
							</div>
							<div className="h-12 w-px bg-light" />
							<div>
								<p className="text-3xl md:text-4xl font-bold text-gray-900">10+</p>
								<p className="text-gray-900 text-sm">Years Active</p>
							</div>
						</div>
					</div>

					{/* Right Image with Decorative Elements */}
					<div className="relative hidden lg:block">
						<div className="relative z-10">
							{/* Main Image Container */}
							<div className="relative">
								<Image src="/rabi1.webp" alt="Community member" width={600} height={700} className="relative z-20 object-cover rounded-2xl" priority />

								{/* Floating Card - Top Left */}
								<div className="absolute -top-8 -left-8 bg-white rounded-2xl shadow-2xl p-6 transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-30">
									<div className="flex items-center gap-4">
										<div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-blue-600 flex items-center justify-center">
											<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
											</svg>
										</div>
										<div>
											<p className="text-2xl font-bold text-gray-900">2K+</p>
											<p className="text-sm text-gray-900">Community</p>
										</div>
									</div>
								</div>

								{/* Floating Card - Bottom Right */}
								<div className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-2xl p-6 transform rotate-6 hover:rotate-0 transition-transform duration-500 z-30">
									<div className="flex items-center gap-4">
										<div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
											<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
											</svg>
										</div>
										<div>
											<p className="text-2xl font-bold text-gray-900">100%</p>
											<p className="text-sm text-gray-900">Verified</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Mobile Image */}
					<div className="lg:hidden relative h-[400px] rounded-2xl overflow-hidden">
						<Image src="/rabi1.webp" alt="Community member" fill className="object-cover" priority />
					</div>
				</div>
			</div>
		</section>
	);
}
