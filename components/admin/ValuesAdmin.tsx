"use client";

import { useState, useEffect } from "react";
import { Sparkles, Eye, Save, RefreshCw, Plus, Trash2, GripVertical, Landmark, Users, Globe } from "lucide-react";
import { toast } from "react-hot-toast";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}

interface ValueItem {
	title: MultilingualField;
	description: MultilingualField;
	icon: string;
	order: number;
}

interface ValuesData {
	title: MultilingualField;
	values: ValueItem[];
}

interface ValuesPreviewProps {
	data: ValuesData;
	locale: string;
}

const ValuesPreview = ({ data, locale }: ValuesPreviewProps) => {
	const getLocalizedField = (field: MultilingualField) => {
		return field[locale as keyof MultilingualField] || field.en || "";
	};

	const getIconComponent = (iconName: string) => {
		switch (iconName) {
			case 'Landmark':
				return Landmark;
			case 'Users':
				return Users;
			case 'Globe':
				return Globe;
			default:
				return Landmark;
		}
	};

	const sortedValues = [...data.values].sort((a, b) => a.order - b.order);

	return (
		<div className="space-y-4">
			<h3 className="text-xl font-bold text-gray-900 mb-4">
				{getLocalizedField(data.title)}
			</h3>
			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
				{sortedValues.map((value, index) => {
					const IconComponent = getIconComponent(value.icon);
					return (
						<div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
							<div className="w-12 h-12 mb-4 bg-brand_primary rounded-lg flex items-center justify-center">
								<IconComponent className="w-6 h-6 text-white" />
							</div>
							<h4 className="text-lg font-semibold text-gray-900 mb-2">
								{getLocalizedField(value.title)}
							</h4>
							<p className="text-gray-600 text-sm">
								{getLocalizedField(value.description)}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default function ValuesAdmin() {
	const [data, setData] = useState<ValuesData>({
		title: { en: "", no: "", ne: "" },
		values: []
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

	const iconOptions = [
		{ value: "Landmark", label: "Landmark", icon: Landmark },
		{ value: "Users", label: "Users", icon: Users },
		{ value: "Globe", label: "Globe", icon: Globe }
	];

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/values?edit=true");
			if (response.ok) {
				const fetchedData = await response.json();
				setData(fetchedData);
			}
		} catch {
			toast.error("Failed to fetch values data");
		} finally {
			setLoading(false);
		}
	};

	const handleTitleChange = (locale: "en" | "no" | "ne", value: string) => {
		setData(prev => ({
			...prev,
			title: {
				...prev.title,
				[locale]: value
			}
		}));
		setHasChanges(true);
	};

	const handleValueChange = (index: number, field: "title" | "description", locale: "en" | "no" | "ne", value: string) => {
		setData(prev => ({
			...prev,
			values: prev.values.map((item, i) => 
				i === index 
					? {
						...item,
						[field]: {
							...item[field],
							[locale]: value
						}
					}
					: item
			)
		}));
		setHasChanges(true);
	};

	const handleIconChange = (index: number, icon: string) => {
		setData(prev => ({
			...prev,
			values: prev.values.map((item, i) => 
				i === index ? { ...item, icon } : item
			)
		}));
		setHasChanges(true);
	};

	const addNewValue = () => {
		const newOrder = Math.max(...data.values.map(v => v.order), -1) + 1;
		setData(prev => ({
			...prev,
			values: [...prev.values, {
				title: { en: "", no: "", ne: "" },
				description: { en: "", no: "", ne: "" },
				icon: "Landmark",
				order: newOrder
			}]
		}));
		setHasChanges(true);
	};

	const removeValue = (index: number) => {
		setData(prev => ({
			...prev,
			values: prev.values.filter((_, i) => i !== index)
		}));
		setHasChanges(true);
	};

	const moveValue = (index: number, direction: "up" | "down") => {
		const newValues = [...data.values];
		const targetIndex = direction === "up" ? index - 1 : index + 1;
		
		if (targetIndex >= 0 && targetIndex < newValues.length) {
			// Swap values
			[newValues[index], newValues[targetIndex]] = [newValues[targetIndex], newValues[index]];
			
			// Update orders
			newValues[index].order = index;
			newValues[targetIndex].order = targetIndex;
			
			setData(prev => ({ ...prev, values: newValues }));
			setHasChanges(true);
		}
	};

	const handleSave = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/values", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			});

			if (response.ok) {
				toast.success("Values saved successfully!");
				setHasChanges(false);
			} else {
				toast.error("Failed to save values");
			}
		} catch {
			toast.error("Failed to save values");
		} finally {
			setLoading(false);
		}
	};

	const handleReset = async () => {
		await fetchData();
		setHasChanges(false);
		toast.success("Data reset to last saved state");
	};

	if (loading && !data.title.en) {
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
					<h1 className="text-2xl font-bold text-gray-900">Values</h1>
					<p className="text-gray-600 mt-1">Manage organizational values in multiple languages</p>
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
						<ValuesPreview data={data} locale={activeTab} />
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

					<div className="space-y-6">
						{/* Section Title */}
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">Section Title</h3>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Title ({locales.find(l => l.code === activeTab)?.name})
								</label>
								<input
									type="text"
									value={data.title[activeTab]}
									onChange={(e) => handleTitleChange(activeTab, e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
									placeholder="Enter section title..."
								/>
							</div>
						</div>

						{/* Values List */}
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-semibold text-gray-900">Values</h3>
								<button
									onClick={addNewValue}
									className="flex items-center gap-2 px-3 py-2 bg-brand_primary text-white rounded-lg font-medium hover:bg-brand_primary/90 transition-colors"
								>
									<Plus className="w-4 h-4" />
									Add Value
								</button>
							</div>

							<div className="space-y-4">
								{data.values.map((value, index) => (
									<div key={index} className="border border-gray-200 rounded-lg p-4">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<GripVertical className="w-5 h-5 text-gray-400" />
												<span className="font-medium text-gray-900">Value {index + 1}</span>
											</div>
											<div className="flex items-center gap-2">
												<button
													onClick={() => moveValue(index, "up")}
													disabled={index === 0}
													className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
												>
													↑
												</button>
												<button
													onClick={() => moveValue(index, "down")}
													disabled={index === data.values.length - 1}
													className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
												>
													↓
												</button>
												<button
													onClick={() => removeValue(index)}
													className="p-1 text-red-500 hover:text-red-600"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</div>

										<div className="space-y-4">
											<div className="grid grid-cols-3 gap-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Title ({locales.find(l => l.code === activeTab)?.name})
													</label>
													<input
														type="text"
														value={value.title[activeTab]}
														onChange={(e) => handleValueChange(index, "title", activeTab, e.target.value)}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
														placeholder="Enter title..."
													/>
												</div>
												<div className="col-span-2">
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Description ({locales.find(l => l.code === activeTab)?.name})
													</label>
													<input
														type="text"
														value={value.description[activeTab]}
														onChange={(e) => handleValueChange(index, "description", activeTab, e.target.value)}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
														placeholder="Enter description..."
													/>
												</div>
											</div>

											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
												<div className="flex gap-2">
													{iconOptions.map(option => (
														<button
															key={option.value}
															onClick={() => handleIconChange(index, option.value)}
															className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
																value.icon === option.value
																	? "border-brand_primary bg-brand_primary/10 text-brand_primary"
																	: "border-gray-200 hover:border-gray-300"
															}`}
														>
															<option.icon className="w-4 h-4" />
															<span>{option.label}</span>
														</button>
													))}
												</div>
											</div>
										</div>
									</div>
								))}

								{data.values.length === 0 && (
									<div className="text-center py-8 text-gray-500">
										<Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-300" />
										<p>No values added yet. Click &quot;Add Value&quot; to get started.</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
