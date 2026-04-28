"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Translations {
	title: string;
	subtitle: string;
	email: string;
	emailPlaceholder: string;
	sendResetLink: string;
	backToLogin: string;
	success: string;
	successMessage: string;
	error: string;
	invalidEmail: string;
	emailNotFound: string;
	redirecting: string;
}

interface Props {
	translations: Translations;
}

export default function ForgotPasswordClient({ translations: t }: Props) {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		// Basic email validation
		if (!email || !email.includes("@")) {
			setError(t.invalidEmail);
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("/api/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				if (response.status === 404) {
					setError(t.emailNotFound);
				} else {
					setError(data.error || t.error);
				}
				setLoading(false);
				return;
			}

			setSuccess(true);
			setTimeout(() => {
				router.push("/login");
			}, 5000);
		} catch (error) {
			console.error("Forgot password error:", error);
			setError(t.error);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="bg-white rounded-xl shadow-xl p-8">
					<div className="text-center">
						<div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
							<Mail className="h-6 w-6 text-blue-600" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
						<p className="text-gray-600 text-sm">{t.subtitle}</p>
					</div>

					{success ? (
						<div className="text-center py-8">
							<div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
								<CheckCircle className="h-8 w-8 text-green-600" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">{t.success}</h3>
							<p className="text-gray-600 mb-6">{t.successMessage}</p>
							<p className="text-sm text-gray-500">{t.redirecting}...</p>
						</div>
					) : (
						<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
									{t.email}
								</label>
								<input
									id="email"
									name="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder={t.emailPlaceholder}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							{error && (
								<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
									{error}
								</div>
							)}

							<div className="space-y-3">
								<button
									type="submit"
									disabled={loading}
									className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{loading ? (
										<span className="flex items-center justify-center">
											<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8C4.5 8 4 8.5 4 9z"></path>
											</svg>
											Sending...
										</span>
									) : (
										t.sendResetLink
									)}
								</button>

								<Link
									href="/login"
									className="w-full inline-flex items-center justify-center text-gray-600 hover:text-gray-900 font-medium py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									{t.backToLogin}
								</Link>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
