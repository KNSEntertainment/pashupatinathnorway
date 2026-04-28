"use client";
import React, { memo, useCallback, useState } from "react";
import { Label } from "./ui/label";
import { Eye, EyeOff, Mail, User, UserPlus, Lock } from "lucide-react";
import { Button } from "./ui/button";
// import { useRouter } from "next/navigation";
import { Input } from "./ui/input";

const InputField = memo(({ id, icon: Icon, name, value, onChange, ...props }) => (
	<div className="relative">
		<Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
		<Input id={id} name={name} value={value} onChange={onChange} {...props} className="pl-10" />
	</div>
));

InputField.displayName = "Input_Fields_User_Auth_Form";

const RegisterForm = ({ handleCloseUserModal }) => {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	// const router = useRouter();
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		userName: "",
		password: "",
		role: "user",
	});

	const handleRegister = async (e) => {
		e.preventDefault();
		setError("");
		// Frontend validation
		if (!formData.fullName.trim() || !formData.email.trim() || !formData.userName.trim() || !formData.password.trim() || !formData.role.trim()) {
			setError("All fields are required.");
			return;
		}
		try {
			const response = await fetch("/api/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			const result = await response.json();
			if (result.success) {
				setFormData({
					fullName: "",
					email: "",
					userName: "",
					password: "",
					role: "user",
				});
				alert("User created successfully");
				if (handleCloseUserModal) handleCloseUserModal();
			} else if (result.error) {
				setError(result.error);
			}
		} catch (error) {
			setError(error.message);
			console.error("Error Creating User:", error);
		}
	};

	const handleCancel = useCallback(() => {
		setFormData({
			fullName: "",
			email: "",
			userName: "",
			password: "",
			role: "user",
		});
		setError("");
		if (handleCloseUserModal) handleCloseUserModal();
	}, [handleCloseUserModal]);

	const togglePasswordVisibility = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	return (
		<form onSubmit={handleRegister}>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="register-role">User Role</Label>
					<select id="register-role" name="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="block w-full rounded-md border-light shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50 px-3 py-2">
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="register-name">Full Name</Label>
					<InputField id="register-name" icon={User} name="fullName" type="text" placeholder="Enter your full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="register-email">Email</Label>
					<InputField id="register-email" icon={Mail} name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
				</div>
				<div className="space-y-2">
					<Label htmlFor="register-username">Username</Label>
					<InputField id="register-username" icon={UserPlus} name="userName" type="text" placeholder="Choose a username" value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="register-password">Password</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
						<Input id="register-password" name="password" type={showPassword ? "text" : "password"} placeholder="Choose a password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="pl-10 pr-10" />
						<button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900">
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div>
			</div>
			{error && <p className="mt-2 text-red-600">{error}</p>}
			<div className="mt-6 flex justify-between">
				<Button type="submit" className="bg-brand_primary hover:bg-red-800">
					Register
				</Button>
				<Button type="button" variant="outline" onClick={handleCancel}>
					Close
				</Button>
			</div>
		</form>
	);
};

export default RegisterForm;
