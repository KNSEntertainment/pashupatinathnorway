"use client";

import React from "react";
import { useRouter } from "next/navigation";
import SettingForm from "@/components/SettingForm";
import useFetchData from "@/hooks/useFetchData";

export default function SettingsPage() {
	const { data: settings, error, loading } = useFetchData("/api/settings", "settings");
	const router = useRouter();

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	return (
		<div className="bg-white md:px-4 lg:px-6 rounded-lg shadow-lg max-w-6xl">
			<h2 className="text-lg font-bold text-gray-700 bg-brand_primary p-4 mb-4 text-center">Update Profile</h2>
			<SettingForm fetchSettings={settings} settingdata={settings} onClose={() => router.push("/en/dashboard")} />
		</div>
	);
}
