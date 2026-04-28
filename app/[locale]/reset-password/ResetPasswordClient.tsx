"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

interface Translations {
	title: string;
	subtitle: string;
	newPassword: string;
	confirmPassword: string;
	resetPassword: string;
	passwordMismatch: string;
	passwordTooShort: string;
	success: string;
	successMessage: string;
	error: string;
	invalidToken: string;
	redirecting: string;
	goToLogin: string;
}

interface Props {
	translations: Translations;
}

export default function ResetPasswordClient({ translations: t }: Props) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!token) {
			setError(t.invalidToken);
		}
	}, [token, t]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (formData.password.length < 6) {
			setError(t.passwordTooShort);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError(t.passwordMismatch);
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					token,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || t.error);
				setLoading(false);
				return;
			}

			setSuccess(true);
			setTimeout(() => {
				router.push("/login");
			}, 3000);
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="bg-white rounded-xl shadow-xl p-8">
					<div className="text-center">
						<div className="mx-auto h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
							<svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 012 12m0 0a6 6 0 01-6-6m6 6V9a2 2 0 00-2-2M9 19a2 2 0 01-2-2m2 2a2 2 0 002-2m-2-2a2 2 0 00-2 2m4 0V7a2 2 0 012-2" />
							</svg>
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
								<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
									{t.newPassword}
								</label>
								<div className="relative">
									<input
										id="password"
										name="password"
										type={showPassword ? "text" : "password"}
										required
										value={formData.password}
										onChange={handleChange}
										placeholder="Enter your new password"
										className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4 text-gray-400" />
										) : (
											<Eye className="h-4 w-4 text-gray-400" />
										)}
									</button>
								</div>
							</div>

							<div>
								<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
									{t.confirmPassword}
								</label>
								<div className="relative">
									<input
										id="confirmPassword"
										name="confirmPassword"
										type={showConfirmPassword ? "text" : "password"}
										required
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="Confirm your new password"
										className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center"
									>
										{showConfirmPassword ? (
											<EyeOff className="h-4 w-4 text-gray-400" />
										) : (
											<Eye className="h-4 w-4 text-gray-400" />
										)}
									</button>
								</div>
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
									className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{loading ? (
										<span className="flex items-center justify-center">
											<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8C4.5 8 4 8.5 4 9z"></path>
											</svg>
											Resetting...
										</span>
									) : (
										t.resetPassword
									)}
								</button>

								<button
									type="button"
									onClick={() => router.push("/login")}
									className="w-full inline-flex items-center justify-center text-gray-600 hover:text-gray-900 font-medium py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
								>
									{t.goToLogin}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
