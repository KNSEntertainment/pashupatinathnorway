"use client";
import React, { memo, useCallback, useState } from "react";
import { Label } from "./ui/label";
import { Eye, EyeOff, Mail, User, UserPlus, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const InputField = memo(({ id, icon: Icon, name, value, onChange, ...props }) => (
	<div className="relative">
		<Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
		<Input id={id} name={name} value={value} onChange={onChange} {...props} className="pl-10" />
	</div>
));

InputField.displayName = "Input_Fields_Edit_User_Form";

const EditUserForm = ({ user, handleCloseEditModal, fetchUsers }) => {
	const [showPassword, setShowPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [error, setError] = useState("");
	const [formData, setFormData] = useState({
		fullName: user.fullName || "",
		email: user.email || "",
		userName: user.userName || "",
		role: user.role || "user",
		password: "",
		newPassword: "",
		confirmNewPassword: "",
	});

	const handleUpdate = async (e) => {
		e.preventDefault();
		setError("");

		// Frontend validation
		if (!formData.fullName.trim() || !formData.email.trim() || !formData.userName.trim() || !formData.role.trim()) {
			setError("All fields except password are required.");
			return;
		}

		// Password validation if new password is provided
		if (formData.newPassword) {
			if (formData.newPassword !== formData.confirmNewPassword) {
				setError("New passwords do not match.");
				return;
			}
			if (formData.newPassword.length < 6) {
				setError("New password must be at least 6 characters long.");
				return;
			}
		}

		try {
			const updateData = {
				fullName: formData.fullName,
				email: formData.email,
				userName: formData.userName,
				role: formData.role,
			};

			// Only include password if a new one is provided
			if (formData.newPassword) {
				updateData.password = formData.newPassword;
			}

			const response = await fetch(`/api/users/${user._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			const result = await response.json();
			if (result.success) {
				alert("User updated successfully");
				if (handleCloseEditModal) handleCloseEditModal();
				if (fetchUsers) fetchUsers();
			} else if (result.error) {
				setError(result.error);
			}
		} catch (error) {
			setError(error.message);
			console.error("Error Updating User:", error);
		}
	};

	const handleCancel = useCallback(() => {
		setError("");
		if (handleCloseEditModal) handleCloseEditModal();
	}, [handleCloseEditModal]);

	const togglePasswordVisibility = useCallback(() => {
		setShowPassword((prev) => !prev);
	}, []);

	const toggleNewPasswordVisibility = useCallback(() => {
		setShowNewPassword((prev) => !prev);
	}, []);

	return (
		<form onSubmit={handleUpdate}>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="edit-role">User Role</Label>
					<select
						id="edit-role"
						name="role"
						value={formData.role}
						onChange={(e) => setFormData({ ...formData, role: e.target.value })}
						className="block w-full rounded-md border-light shadow-sm focus:border-red-500 focus:ring focus:ring-red-200 focus:ring-opacity-50 px-3 py-2"
					>
						<option value="admin">Admin</option>
						<option value="user">User</option>
					</select>
				</div>
				<div className="space-y-2">
					<Label htmlFor="edit-name">Full Name</Label>
					<InputField
						id="edit-name"
						icon={User}
						name="fullName"
						type="text"
						placeholder="Enter full name"
						value={formData.fullName}
						onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="edit-email">Email</Label>
					<InputField
						id="edit-email"
						icon={Mail}
						name="email"
						type="email"
						placeholder="Enter email"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="edit-username">Username</Label>
					<InputField
						id="edit-username"
						icon={UserPlus}
						name="userName"
						type="text"
						placeholder="Enter username"
						value={formData.userName}
						onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="edit-new-password">New Password (leave empty to keep current)</Label>
					<div className="relative">
						<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
						<Input
							id="edit-new-password"
							name="newPassword"
							type={showNewPassword ? "text" : "password"}
							placeholder="Enter new password or leave empty"
							value={formData.newPassword}
							onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
							className="pl-10 pr-10"
						/>
						<button
							type="button"
							onClick={toggleNewPasswordVisibility}
							className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-900"
						>
							{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div>

				{formData.newPassword && (
					<div className="space-y-2">
						<Label htmlFor="edit-confirm-password">Confirm New Password</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-900" />
							<Input
								id="edit-confirm-password"
								name="confirmNewPassword"
								type={showNewPassword ? "text" : "password"}
								placeholder="Confirm new password"
								value={formData.confirmNewPassword}
								onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
								className="pl-10 pr-10"
							/>
						</div>
					</div>
				)}
			</div>
			{error && <p className="mt-2 text-red-600">{error}</p>}
			<div className="mt-6 flex justify-between">
				<Button type="submit" className="bg-brand_primary hover:bg-red-800">
					Update User
				</Button>
				<Button type="button" variant="outline" onClick={handleCancel}>
					Cancel
				</Button>
			</div>
		</form>
	);
};

export default EditUserForm;
