"use client";

import React, { useState, useCallback, memo, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

const InputField = memo(({ id, icon: Icon, name, value, onChange, ...props }) => (
	<div className="relative">
		<Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
		<Input id={id} name={name} value={value} onChange={onChange} {...props} className="pl-10" />
	</div>
));

InputField.displayName = "Input_Fields_User_Auth_Form";

export default function AuthFormContent() {
	const router = useRouter();
	const t = useTranslations("login");
	const locale = useLocale();

	const searchParams = useSearchParams();
	const initialEmail = searchParams.get("email") || "";
	const initialToken = searchParams.get("token") || "";
	const [formData, setFormData] = useState({
		fullName: "",
		email: initialEmail,
		userName: "",
		password: "",
	});
	const [inviteToken, setInviteToken] = useState(initialToken);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const hasInvite = Boolean(inviteToken);

	useEffect(() => {
		const email = searchParams.get("email") || "";
		const token = searchParams.get("token") || "";
		setFormData((prev) => (prev.email === email ? prev : { ...prev, email }));
		setInviteToken(token);
	}, [searchParams]);

	// Optimized input change handler
	const handleInputChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			if (prev[name] === value) return prev; // Avoid unnecessary state updates
			return { ...prev, [name]: value };
		});
	}, []);

	const handleLogin = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setSubmitting(true);

		const result = await signIn("credentials", {
			redirect: false,
			email: formData.email,
			password: formData.password,
		});

		setSubmitting(false);

		if (result?.ok) {
			// Small delay to ensure session is set
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Fetch session to check user role
			const response = await fetch("/api/auth/session");
			const session = await response.json();

			// Redirect based on role using current locale
			if (session?.user?.role === "admin") {
				console.log("Redirecting admin to dashboard");
				window.location.href = `/${locale}/dashboard`;
			} else {
				window.location.href = `/${locale}/profile`;
			}
		} else {
			console.log("Login failed:", result?.error);
			setError(result?.error || t("error"));
		}
	};

	const handleCancel = useCallback(() => {
		setFormData({
			fullName: "",
			email: "",
			userName: "",
			password: "",
		});
		setError("");
		router.push("/");
	}, [router]);

	// Password visibility toggle
	const togglePasswordVisibility = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	return (
		<div className="min-h-screen flex items-center justify-center bg-light p-4">
			<Card className="w-full max-w-md mx-auto">
				<CardHeader className="bg-brand_primary text-gray-700 rounded-t-lg text-center">
					<CardTitle className="text-2xl font-bold">{hasInvite ? t("set_password") : t("title")}</CardTitle>
				</CardHeader>
				<CardContent className="mt-6">
					{error && <p className="text-red-500 mb-4 text-center">{error}</p>}
					{success && (
						<p className="mb-4 flex items-center justify-center gap-2 text-brand_primary text-sm">
							<CheckCircle2 className="h-4 w-4" /> {success}
						</p>
					)}
					{hasInvite ? (
						<form onSubmit={handleSetPassword} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="set-email">{t("email")}</Label>
								<InputField id="set-email" icon={Mail} name="email" type="email" value={formData.email} onChange={handleInputChange} readOnly />
							</div>
							<div className="space-y-2">
								<Label htmlFor="set-password">{t("password")}</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
									<Input id="set-password" name="password" type={showPassword ? "text" : "password"} placeholder={t("password_placeholder")} value={formData.password} onChange={handleInputChange} className="pl-10 pr-10" />
									<button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900">
										{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
									</button>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="confirm-password">Confirm Password</Label>
								<Input id="confirm-password" name="confirmPassword" type={showPassword ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
							</div>
							<div className="mt-6 flex justify-end gap-2">
								<Button type="button" variant="outline" onClick={handleCancel}>
									{t("cancel_button")}
								</Button>
								<Button type="submit" className="bg-brand_primary hover:bg-orange-400" disabled={submitting}>
									{submitting ? "Saving..." : "Set password"}
								</Button>
							</div>
						</form>
					) : (
						<Tabs defaultValue="login" className="w-full">
							<TabsContent value="login">
								<form onSubmit={handleLogin}>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="login-email">{t("email")}</Label>
											<InputField id="login-email" icon={Mail} name="email" type="email" placeholder={t("email_placeholder")} value={formData.email} onChange={handleInputChange} />
										</div>
										<div className="space-y-2">
											<Label htmlFor="login-password">{t("password")}</Label>
											<div className="relative">
												<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
												<Input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder={t("password_placeholder")} value={formData.password} onChange={handleInputChange} className="pl-10 pr-10" />
												<button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900">
													{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
												</button>
											</div>
										</div>
									</div>
									<div className="mt-4 text-center">
										<Link href={`/${locale}/forgot-password`} className="text-sm text-gray-700 hover:underline">
											{t("forgot_password")}
										</Link>
									</div>
									<div className="mt-6 flex justify-between">
										<Button type="button" variant="outline" onClick={handleCancel}>
											{t("cancel_button")}
										</Button>
										<Button type="submit" className="bg-brand_primary text-gray-700 hover:bg-orange-400" disabled={submitting}>
											{submitting ? t("logging_in") : t("login_button")}
										</Button>
									</div>
								</form>
							</TabsContent>
						</Tabs>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
