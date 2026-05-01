"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle } from "lucide-react";

interface Translations {
	title: string;
	subtitle: string;
	newPassword: string;
	confirmPassword: string;
	setPassword: string;
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

export default function SetPasswordClient({ translations: t }: Props) {
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
			const response = await fetch("/api/set-password", {
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
				router.push("/en/login");
			}, 3000);
		} catch (error) {
			setError(error instanceof Error ? error.message : String(error));
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
					<div className="flex justify-center mb-4">
						<CheckCircle className="w-16 h-16 text-success0" />
					</div>
					<h2 className="text-2xl font-bold text-gray-900 mb-2">{t.success}</h2>
					<p className="text-gray-900 mb-4">{t.successMessage}</p>
					<p className="text-sm text-gray-900">{t.redirecting}</p>
					<button onClick={() => router.push("/en/login")} className="mt-4 text-brand_primary hover:text-brand_primary underline">
						{t.goToLogin}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="h-[600px] flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
				<p className="text-gray-900 mb-6">{t.subtitle}</p>

				{error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">{error}</div>}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1">
							{t.newPassword}
						</label>
						<div className="relative">
							<input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={!token || loading} />
							<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 hover:text-gray-900">
								{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
							</button>
						</div>
					</div>

					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1">
							{t.confirmPassword}
						</label>
						<div className="relative">
							<input type={showConfirmPassword ? "text" : "password"} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required disabled={!token || loading} />
							<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 hover:text-gray-900">
								{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
							</button>
						</div>
					</div>

					<button type="submit" disabled={!token || loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed">
						{loading ? "Setting Password..." : t.setPassword}
					</button>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-900">Password must be at least 6 characters long</p>
				</div>
			</div>
		</div>
	);
}
