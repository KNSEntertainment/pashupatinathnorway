"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { 
  PartyPopper, 
  Star, 
  Heart, 
  Sparkles,
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
  Star as StarIcon
} from "lucide-react";
import { toast } from "react-hot-toast";

interface MultilingualField {
  en: string;
  no: string;
  ne: string;
}

interface MultilingualArray {
  en: string[];
  no: string[];
  ne: string[];
}

interface Festival {
  _id?: string;
  title: MultilingualField;
  description: MultilingualField;
  icon: string;
  features: MultilingualArray;
  timing: MultilingualField;
  highlight: boolean;
  order: number;
  isActive: boolean;
}

const iconOptions = [
  { value: "Star", label: "Star", icon: Star },
  { value: "Heart", label: "Heart", icon: Heart },
  { value: "Sparkles", label: "Sparkles", icon: Sparkles },
  { value: "PartyPopper", label: "PartyPopper", icon: PartyPopper },
];

export default function FestivalsAdmin() {
  const locale = useLocale();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"en" | "no" | "ne">("en");
  const [showInactive, setShowInactive] = useState(false);

  const locales = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "no", name: "Norwegian", flag: "🇳🇴" },
    { code: "ne", name: "Nepali", flag: "🇳🇵" }
  ];

  const emptyFestival: Festival = {
    title: { en: "", no: "", ne: "" },
    description: { en: "", no: "", ne: "" },
    icon: "Star",
    features: { en: [], no: [], ne: [] },
    timing: { en: "", no: "", ne: "" },
    highlight: false,
    order: 0,
    isActive: true
  };

  useEffect(() => {
    fetchFestivals();
  }, [locale]);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/festivals?edit=true&locale=${locale}`);
      if (response.ok) {
        const data = await response.json();
        setFestivals(data);
      } else {
        toast.error("Failed to fetch festivals");
      }
    } catch {
      toast.error("Failed to fetch festivals");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof Festival, value: string | boolean | number | MultilingualField | MultilingualArray) => {
    if (!editingFestival) return;

    if (field === "features") {
      const localeValue = value as string;
      setEditingFestival(prev => ({
        ...prev!,
        features: {
          ...prev!.features,
          [activeTab]: localeValue.split(",").map(item => item.trim()).filter(Boolean)
        }
      }));
    } else if (field === "title" || field === "description" || field === "timing") {
      setEditingFestival(prev => ({
        ...prev!,
        [field]: {
          ...prev![field] as MultilingualField,
          [activeTab]: value
        }
      }));
    } else {
      setEditingFestival(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!editingFestival) return;

    // Validate required fields
    if (!editingFestival.title.en.trim() || !editingFestival.description.en.trim()) {
      toast.error("English title and description are required");
      return;
    }

    try {
      setLoading(true);
      const url = editingFestival._id 
        ? "/api/festivals" 
        : "/api/festivals";
      const method = editingFestival._id ? "PUT" : "POST";

      // For PUT requests, include the id as a separate field
      const requestBody = editingFestival._id 
        ? { ...editingFestival, id: editingFestival._id }
        : editingFestival;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        toast.success(`Festival ${editingFestival._id ? "updated" : "created"} successfully!`);
        setEditingFestival(null);
        setIsCreating(false);
        fetchFestivals();
      } else {
        toast.error(`Failed to ${editingFestival._id ? "update" : "create"} festival`);
      }
    } catch {
      toast.error(`Failed to ${editingFestival._id ? "update" : "create"} festival`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this festival?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/festivals?id=${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Festival deleted successfully!");
        fetchFestivals();
      } else {
        toast.error("Failed to delete festival");
      }
    } catch {
      toast.error("Failed to delete festival");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (festival: Festival) => {
    try {
      setLoading(true);
      const updatedFestival = { ...festival, isActive: !festival.isActive };
      
      const response = await fetch("/api/festivals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...updatedFestival, id: updatedFestival._id })
      });

      if (response.ok) {
        toast.success(`Festival ${updatedFestival.isActive ? "activated" : "deactivated"} successfully!`);
        fetchFestivals();
      } else {
        toast.error("Failed to update festival status");
      }
    } catch {
      toast.error("Failed to update festival status");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (festival: Festival) => {
    setEditingFestival({ ...festival });
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditingFestival({ ...emptyFestival });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingFestival(null);
    setIsCreating(false);
  };

  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.icon : Star;
  };

  const getLocalizedField = (field: MultilingualField | MultilingualArray): string | string[] => {
    if (Array.isArray(field)) {
      return field[activeTab] || field.en || [];
    }
    return field[activeTab] || field.en || "";
  };

  if (loading && festivals.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Festivals Management</h1>
          <p className="text-gray-600 mt-1">Manage temple festivals and celebrations in multiple languages</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              showInactive
                ? "bg-gray-100 text-gray-700"
                : "bg-brand_primary text-gray-600"
            }`}
          >
            {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showInactive ? "Hide Inactive" : "Show Inactive"}
          </button>
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-4 py-2 bg-brand_primary text-gray-600 rounded-lg font-medium hover:bg-brand_primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Festival
          </button>
        </div>
      </div>

      {editingFestival ? (
        /* Edit/Create Form */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isCreating ? "Create New Festival" : "Edit Festival"}
            </h2>
            <button
              onClick={cancelEdit}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title ({locales.find(l => l.code === activeTab)?.name})
              </label>
              <input
                type="text"
                value={editingFestival.title[activeTab]}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                placeholder="Enter festival title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description ({locales.find(l => l.code === activeTab)?.name})
              </label>
              <textarea
                value={editingFestival.description[activeTab]}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                placeholder="Enter festival description..."
              />
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
              <div className="flex gap-2">
                {iconOptions.map(option => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFieldChange("icon", option.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        editingFestival.icon === option.value
                          ? "border-brand_primary bg-brand_primary/10 text-brand_primary"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features ({locales.find(l => l.code === activeTab)?.name})
              </label>
              <input
                type="text"
                value={(getLocalizedField(editingFestival.features) as string[]).join(", ")}
                onChange={(e) => handleFieldChange("features", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                placeholder="Enter features separated by commas..."
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple features with commas</p>
            </div>

            {/* Timing */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timing ({locales.find(l => l.code === activeTab)?.name})
              </label>
              <input
                type="text"
                value={editingFestival.timing[activeTab]}
                onChange={(e) => handleFieldChange("timing", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                placeholder="Enter timing information..."
              />
            </div>

            {/* Order, Highlight and Status */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={editingFestival.order}
                  onChange={(e) => handleFieldChange("order", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                  placeholder="Display order..."
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFestival.highlight}
                    onChange={(e) => handleFieldChange("highlight", e.target.checked)}
                    className="w-4 h-4 text-brand_primary border-gray-300 rounded focus:ring-brand_primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingFestival.isActive}
                    onChange={(e) => handleFieldChange("isActive", e.target.checked)}
                    className="w-4 h-4 text-brand_primary border-gray-300 rounded focus:ring-brand_primary"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-brand_primary text-white rounded-lg font-medium hover:bg-brand_primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : (isCreating ? "Create" : "Update")}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Festivals Table */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Festival
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {festivals
                  .filter(festival => showInactive || festival.isActive)
                  .map((festival) => {
                    const IconComponent = getIconComponent(festival.icon);
                    return (
                      <tr key={festival._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                              festival.highlight
                                ? "bg-gradient-to-br from-purple-600 to-pink-600"
                                : "bg-brand_primary/10"
                            }`}>
                              <IconComponent className={`w-5 h-5 ${festival.highlight ? "text-white" : "text-brand_primary"}`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {festival.title.en}
                              </div>
                              <div className="text-xs text-gray-500">
                                {festival.title.no} / {festival.title.ne}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {festival.description.en}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {festival.timing.en || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {festival.highlight && (
                            <div className="flex items-center text-sm text-purple-600">
                              <StarIcon className="w-4 h-4 mr-1" />
                              Featured
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {festival.order}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            festival.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {festival.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(festival)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={festival.isActive ? "Deactivate" : "Activate"}
                            >
                              {festival.isActive ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                            </button>
                            <button
                              onClick={() => startEdit(festival)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(festival._id!)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {festivals.filter(festival => showInactive || festival.isActive).length === 0 && (
            <div className="text-center py-12">
              <PartyPopper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No festivals found</h3>
              <p className="text-gray-500 mb-4">
                {showInactive ? "No inactive festivals found" : "Get started by creating your first festival"}
              </p>
              {!showInactive && (
                <button
                  onClick={startCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand_primary text-white rounded-lg font-medium hover:bg-brand_primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Festival
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
