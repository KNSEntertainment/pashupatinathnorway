"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

export default function EmployeeForm({ settingdata }) {
	const [formData, setFormData] = useState({
		name: "",
		address: "",
		email: "",
		phone: "",
		mobile: "",
		facebook: "",
		youtube: "",
		instagram: "",
		linkedin: "",
		businessHoursMF: "",
		companyLogo: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (settingdata && settingdata.length > 0) {
			setFormData(settingdata[0]);
		}
	}, [settingdata]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			// Store file object for upload
			setFormData((prev) => ({ ...prev, [e.target.name]: file }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		setMessage("");

		try {
			let url = "/api/settings";
			let method = "POST";
			if (formData._id) {
				url = `/api/settings/${formData._id}`;
				method = "PUT";
			}

			// Use FormData if companyLogo is a file
			let body;
			let headers = {};

			if (formData.companyLogo instanceof File) {
				const form = new FormData();
				Object.keys(formData).forEach((key) => {
					if (key === "companyLogo") {
						form.append(key, formData[key]);
					} else if (formData[key]) {
						form.append(key, formData[key]);
					}
				});
				body = form;
			} else {
				headers = { "Content-Type": "application/json" };
				body = JSON.stringify(formData);
			}

			const response = await fetch(url, {
				method,
				headers,
				body,
			});

			if (!response.ok) {
				throw new Error(method === "POST" ? "Failed to create settings" : "Failed to update settings");
			}

			const result = await response.json();
			if (result.setting && result.setting.companyLogo) {
				setFormData((prev) => ({ ...prev, companyLogo: result.setting.companyLogo }));
			}

			toast.success(method === "POST" ? "Profile created successfully" : "Profile updated successfully");
			setMessage(method === "POST" ? "Profile created successfully" : "Profile updated successfully");
		} catch (err) {
			toast.error("Profile not updated. Please try again.");
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 md:gap-12 bg-white px-2 md:px-12 md:pt-6 pb-2 md:pb-8">
			<div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="name">
						Name
					</label>
					<input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>

				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="address">
						Address
					</label>
					<input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="email">
						Email
					</label>
					<input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="phone">
						Phone
					</label>
					<input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="mobile">
						Mobile
					</label>
					<input type="tel" id="mobile" name="mobile" value={formData.mobile} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="facebook">
						Facebook
					</label>
					<input type="url" id="facebook" name="facebook" value={formData.facebook} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
			</div>
			<div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="youtube">
						YouTube
					</label>
					<input type="url" id="youtube" name="youtube" value={formData.youtube} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="instagram">
						Instagram
					</label>
					<input type="url" id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="linkedin">
						LinkedIn
					</label>
					<input type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="businessHoursMF">
						Business Hours (Mon-Fri)
					</label>
					<input type="text" id="businessHoursMF" name="businessHoursMF" value={formData.businessHoursMF} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>

				<div className="mb-4">
					<label className="block text-gray-900 text-sm font-bold mb-2" htmlFor="companyLogo">
						Company Logo
					</label>
					{formData.companyLogo && <Image src={formData.companyLogo || "/pashupatinath.png"} alt="Company Logo" width={100} height={100} className="w-auto h-24 mb-2 rounded-full" />}
					<input type="file" id="companyLogo" name="companyLogo" onChange={handleImageChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline" />
				</div>
				<div className="grid justify-items-end gap-2 mt-12">
					<button type="submit" disabled={submitting} className={`px-4 py-2 rounded ${submitting ? "bg-neutral-400 cursor-not-allowed" : "bg-brand_primary hover:bg-red-800"} text-neutral-200 font-bold`}>
						{submitting ? "Updating Profile..." : "Update Profile"}
					</button>
				</div>
				{error && <p className="text-red-500 mt-4 text-right">{error}</p>}
				{message && <p className="text-brand_primary mt-4 text-right">{message}</p>}
			</div>
		</form>
	);
}
