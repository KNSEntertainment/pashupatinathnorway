"use client";

import { useState, useEffect } from "react";
import { Target, Eye, Save, RefreshCw, MessageCirclePlusIcon } from "lucide-react";
import { toast } from "react-hot-toast";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}

interface MissionVisionData {
	mission: {
		title: MultilingualField;
		description: MultilingualField;
	};
	vision: {
		title: MultilingualField;
		description: MultilingualField;
	};
}

interface MissionVisionPreviewProps {
	data: MissionVisionData;
	locale: string;
}

const MissionVisionPreview = ({ data, locale }: MissionVisionPreviewProps) => {
	const getLocalizedField = (field: MultilingualField) => {
		return field[locale as keyof MultilingualField] || field.en || "";
	};

	return (
		<div className="space-y-6">
			{/* Mission Preview */}
			<div className="group relative bg-yellow-100 rounded-2xl shadow-xl overflow-hidden border border-gray-100">
				<div className="relative p-6">
					<div className="flex items-center mb-4">
						<div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
							<MessageCirclePlusIcon className="w-6 h-6 text-white" />
						</div>
						<div className="ml-3">
							<span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mission</span>
						</div>
					</div>
					<h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
						{getLocalizedField(data.mission.title)}
					</h3>
					<p className="text-gray-600 leading-relaxed">
						{getLocalizedField(data.mission.description)}
					</p>
				</div>
			</div>

			{/* Vision Preview */}
			<div className="group relative bg-red-900 rounded-2xl shadow-xl overflow-hidden">
				<div className="relative p-6 text-white">
					<div className="flex items-center mb-4">
						<div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
							<Target className="w-6 h-6 text-white" />
						</div>
						<div className="ml-3">
							<span className="text-sm font-semibold text-white/90 uppercase tracking-wide">Vision</span>
						</div>
					</div>
					<h3 className="text-xl font-bold text-white mb-4 leading-tight">
						{getLocalizedField(data.vision.title)}
					</h3>
					<p className="text-white/90 leading-relaxed">
						{getLocalizedField(data.vision.description)}
					</p>
				</div>
			</div>
		</div>
	);
};

export default function MissionVisionAdmin() {
	const [data, setData] = useState<MissionVisionData>({
		mission: {
			title: { en: "", no: "", ne: "" },
			description: { en: "", no: "", ne: "" }
		},
		vision: {
			title: { en: "", no: "", ne: "" },
			description: { en: "", no: "", ne: "" }
		}
	});

	const [activeTab, setActiveTab] = useState<"en" | "no" | "ne">("en");
	const [previewMode, setPreviewMode] = useState(true);
	const [loading, setLoading] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	const locales = [
		{ code: "en", name: "English", flag: "🇬🇧" },
		{ code: "no", name: "Norwegian", flag: "🇳🇴" },
		{ code: "ne", name: "Nepali", flag: "🇳🇵" }
	];

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/mission-vision?edit=true");
			if (response.ok) {
				const fetchedData = await response.json();
				setData(fetchedData);
			}
		} catch {
			toast.error("Failed to fetch mission & vision data");
		} finally {
			setLoading(false);
		}
	};

	const handleFieldChange = (section: "mission" | "vision", field: "title" | "description", locale: "en" | "no" | "ne", value: string) => {
		setData(prev => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: {
					...prev[section][field],
					[locale]: value
				}
			}
		}));
		setHasChanges(true);
	};

	const handleSave = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/mission-vision", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			});

			if (response.ok) {
				toast.success("Mission & Vision saved successfully!");
				setHasChanges(false);
			} else {
				toast.error("Failed to save mission & vision");
			}
		} catch {
			toast.error("Failed to save mission & vision");
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async () => {
		await fetchData();
		setHasChanges(false);
		toast.success("Data reset to last saved state");
	};

	if (loading && !data.mission.title.en) {
		return (
			<div className="flex items-center justify-center h-64">
				<RefreshCw className="w-8 h-8 animate-spin text-brand_primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Mission & Vision</h1>
					<p className="text-gray-600 mt-1">Manage mission and vision statements in multiple languages</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						onClick={() => setPreviewMode(!previewMode)}
						className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
							previewMode
								? "bg-brand_primary text-white"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
					>
						<Eye className="w-4 h-4" />
						{previewMode ? "Edit Mode" : "Preview Mode"}
					</button>
					{hasChanges && (
						<div className="flex items-center gap-2">
							<button
								onClick={handleReset}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
							>
								Reset
							</button>
							<button
								onClick={handleSave}
								disabled={loading}
								className="flex items-center gap-2 px-4 py-2 bg-brand_primary text-white rounded-lg font-medium hover:bg-brand_primary/90 transition-colors disabled:opacity-50"
							>
								<Save className="w-4 h-4" />
								{loading ? "Saving..." : "Save"}
							</button>
						</div>
					)}
				</div>
			</div>

			{previewMode ? (
				/* Preview Mode */
				<div>
					{/* Language Tabs for Preview */}
					<div className="flex gap-2 mb-6">
						{locales.map(locale => (
							<button
								key={locale.code}
								onClick={() => setActiveTab(locale.code as "en" | "no" | "ne")}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
									activeTab === locale.code
										? "bg-brand_primary text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								<span>{locale.flag}</span>
								<span>{locale.name}</span>
							</button>
						))}
					</div>

					<div className="bg-white rounded-xl border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Preview ({locales.find(l => l.code === activeTab)?.name})
						</h3>
						<MissionVisionPreview data={data} locale={activeTab} />
					</div>
				</div>
			) : (
				/* Edit Mode */
				<div>
					{/* Language Tabs */}
					<div className="flex gap-2 mb-6">
						{locales.map(locale => (
							<button
								key={locale.code}
								onClick={() => setActiveTab(locale.code as "en" | "no" | "ne")}
								className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
									activeTab === locale.code
										? "bg-brand_primary text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								<span>{locale.flag}</span>
								<span>{locale.name}</span>
							</button>
						))}
					</div>

					<div className="grid gap-6">
						{/* Mission Section */}
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Mission</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Title ({locales.find(l => l.code === activeTab)?.name})
									</label>
									<input
										type="text"
										value={data.mission.title[activeTab]}
										onChange={(e) => handleFieldChange("mission", "title", activeTab, e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
										placeholder="Enter mission title..."
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Description ({locales.find(l => l.code === activeTab)?.name})
									</label>
									<textarea
										value={data.mission.description[activeTab]}
										onChange={(e) => handleFieldChange("mission", "description", activeTab, e.target.value)}
										rows={4}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
										placeholder="Enter mission description..."
									/>
								</div>
							</div>
						</div>

						{/* Vision Section */}
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Vision</h3>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Title ({locales.find(l => l.code === activeTab)?.name})
									</label>
									<input
										type="text"
										value={data.vision.title[activeTab]}
										onChange={(e) => handleFieldChange("vision", "title", activeTab, e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
										placeholder="Enter vision title..."
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Description ({locales.find(l => l.code === activeTab)?.name})
									</label>
									<textarea
										value={data.vision.description[activeTab]}
										onChange={(e) => handleFieldChange("vision", "description", activeTab, e.target.value)}
										rows={4}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
										placeholder="Enter vision description..."
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
