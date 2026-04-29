"use client";

import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterSection() {
	const t = useTranslations("newsletter");
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/subscribers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ subscriber: email }),
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to subscribe");
			}

			if (result.success) {
				setIsSubmitted(true);
				setEmail("");
			}
		} catch (error) {
			console.error("Subscription error:", error);
			// You could show an error message here if needed
		} finally {
			setIsSubmitting(false);
		}

		// Reset success message after 3 seconds
		setTimeout(() => setIsSubmitted(false), 3000);
	};

	return (
		<section className="py-20 bg-red-900 relative overflow-hidden w-screen left-1/2 right-1/2 -translate-x-1/2">
			{/* Decorative Elements */}
			<div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
			<div className="absolute bottom-10 left-10 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>
			
			{/* Decorative Dotted Lines */}
			<div className="absolute top-1/4 right-0 w-32 h-32 border-r-2 border-dotted border-white/20 transform rotate-45"></div>
			<div className="absolute bottom-1/4 left-0 w-24 h-24 border-l-2 border-dotted border-white/20 transform -rotate-45"></div>
			
			{/* Decorative Envelope */}
			<div className="absolute top-20 right-20 opacity-10">
				<Mail className="w-64 h-64 text-white transform rotate-12" />
			</div>
			
			<div className="container mx-auto px-6 relative z-10">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
						{/* Left Content */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center lg:text-left"
						>
							<div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-6">
								<Mail className="w-8 h-8 text-white" />
							</div>
							
							<h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
								{t("title")}
							</h2>
							
							<p className="text-xl text-white/90 mb-8 max-w-lg">
								{t("description")}
							</p>

							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.6, delay: 0.4 }}
								className="text-white/70 text-sm"
							>
								{t("footer_text")}
							</motion.p>
						</motion.div>

						{/* Right Form */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<form
								onSubmit={handleSubmit}
								className="space-y-4"
							>
								<div className="relative">
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder={t("email_placeholder")}
										className="w-full px-6 py-4 rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-300"
										required
										disabled={isSubmitting || isSubmitted}
									/>
									<Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								</div>

								<button
									type="submit"
									disabled={isSubmitting || isSubmitted}
									className="w-full px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
								>
									{isSubmitting ? (
										<>
											<div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
											{t("subscribing")}
										</>
									) : isSubmitted ? (
										<>
											<CheckCircle className="w-5 h-5" />
											{t("subscribed")}
										</>
									) : (
										<>
											<Send className="w-5 h-5" />
											{t("subscribe_button")}
										</>
									)}
								</button>
							</form>

							{/* Success Message */}
							{isSubmitted && (
								<motion.div
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"
								>
									<div className="flex items-center justify-center gap-2 text-white">
										<CheckCircle className="w-5 h-5" />
										<span>{t("success_message")}</span>
									</div>
								</motion.div>
							)}
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}
