"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
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

interface Ritual {
  _id?: string;
  title: MultilingualField;
  description: MultilingualField;
  imageUrl?: string;
  imageFile?: File;
  features: MultilingualArray;
  timing: MultilingualField;
  order: number;
  isActive: boolean;
}


export default function RitualsAdmin() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"en" | "no" | "ne">("en");
  const [showInactive, setShowInactive] = useState(false);

  const locales = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "no", name: "Norwegian", flag: "🇳🇴" },
    { code: "ne", name: "Nepali", flag: "🇳🇵" }
  ];

  const emptyRitual: Ritual = {
    title: { en: "", no: "", ne: "" },
    description: { en: "", no: "", ne: "" },
    features: { en: [], no: [], ne: [] },
    timing: { en: "", no: "", ne: "" },
    order: 0,
    isActive: true
  };

  useEffect(() => {
    fetchRituals();
  }, []);

  const fetchRituals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/rituals?edit=true");
      if (response.ok) {
        const data = await response.json();
        setRituals(data);
      } else {
        toast.error("Failed to fetch rituals");
      }
    } catch {
      toast.error("Failed to fetch rituals");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof Ritual, value: string | boolean | number | MultilingualField | MultilingualArray) => {
    if (!editingRitual) return;

    if (field === "features") {
      const localeValue = value as string;
      setEditingRitual(prev => ({
        ...prev!,
        features: {
          ...prev!.features,
          [activeTab]: localeValue.split(",").map(item => item.trim()).filter(Boolean)
        }
      }));
    } else if (field === "title" || field === "description" || field === "timing") {
      setEditingRitual(prev => ({
        ...prev!,
        [field]: {
          ...prev![field] as MultilingualField,
          [activeTab]: value
        }
      }));
    } else {
      setEditingRitual(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    if (!editingRitual) return;

    // Validate required fields
    if (!editingRitual.title.en.trim() || !editingRitual.description.en.trim()) {
      toast.error("English title and description are required");
      return;
    }

    try {
      setLoading(true);
      const url = editingRitual._id 
        ? "/api/rituals" 
        : "/api/rituals";
      const method = editingRitual._id ? "PUT" : "POST";

      // Create FormData for image upload
      const formData = new FormData();
      
      // Add all fields to FormData
      formData.append("title", JSON.stringify(editingRitual.title));
      formData.append("description", JSON.stringify(editingRitual.description));
      formData.append("features", JSON.stringify(editingRitual.features));
      formData.append("timing", JSON.stringify(editingRitual.timing));
      formData.append("order", editingRitual.order.toString());
      formData.append("isActive", editingRitual.isActive.toString());
      
      // Add image if available
      if (editingRitual.imageFile) {
        formData.append("image", editingRitual.imageFile);
      }
      
      // For PUT requests, include the id
      if (editingRitual._id) {
        formData.append("id", editingRitual._id);
      }

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        toast.success(`Ritual ${editingRitual._id ? "updated" : "created"} successfully!`);
        setEditingRitual(null);
        setIsCreating(false);
        fetchRituals();
      } else {
        toast.error(`Failed to ${editingRitual._id ? "update" : "create"} ritual`);
      }
    } catch {
      toast.error(`Failed to ${editingRitual._id ? "update" : "create"} ritual`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ritual?")) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/rituals?id=${id}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Ritual deleted successfully!");
        fetchRituals();
      } else {
        console.error("Delete failed:", data);
        if (data.error?.includes("not found")) {
          toast.error("Ritual not found. Refreshing data...");
          fetchRituals();
        } else if (data.error?.includes("Unauthorized")) {
          toast.error("You must be logged in as admin to delete rituals");
        } else {
          toast.error(data.error || "Failed to delete ritual");
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete ritual");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (ritual: Ritual) => {
    try {
      setLoading(true);
      const updatedRitual = { ...ritual, isActive: !ritual.isActive };
      
      const response = await fetch("/api/rituals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedRitual)
      });

      if (response.ok) {
        toast.success(`Ritual ${updatedRitual.isActive ? "activated" : "deactivated"} successfully!`);
        fetchRituals();
      } else {
        toast.error("Failed to update ritual status");
      }
    } catch {
      toast.error("Failed to update ritual status");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (ritual: Ritual) => {
    setEditingRitual({ ...ritual });
    setIsCreating(false);
  };

  const startCreate = () => {
    setEditingRitual({ ...emptyRitual });
    setIsCreating(true);
  };

  const cancelEdit = () => {
    setEditingRitual(null);
    setIsCreating(false);
  };

  
  const getLocalizedField = (field: MultilingualField | MultilingualArray): string | string[] => {
    if (Array.isArray(field)) {
      return field[activeTab] || field.en || [];
    }
    return field[activeTab] || field.en || "";
  };

  if (loading && rituals.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Rituals Management</h1>
          <p className="text-gray-600 mt-1">Manage temple rituals and ceremonies in multiple languages</p>
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
            Add Ritual
          </button>
        </div>
      </div>

      {editingRitual ? (
        /* Edit/Create Form */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {isCreating ? "Create New Ritual" : "Edit Ritual"}
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
                    ? "bg-brand_primary text-gray-700"
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
                value={editingRitual.title[activeTab]}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                placeholder="Enter ritual title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description ({locales.find(l => l.code === activeTab)?.name})
              </label>
              <textarea
                value={editingRitual.description[activeTab]}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                placeholder="Enter ritual description..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ritual Image</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditingRitual(prev => ({
                          ...prev!,
                          imageFile: file
                        }));
                      }
                    }}
                    className="hidden"
                    id="ritual-image-upload"
                  />
                  <label
                    htmlFor="ritual-image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Choose Image</span>
                  </label>
                </div>
                
                {/* Show current image or uploaded image preview */}
                {(editingRitual.imageUrl || editingRitual.imageFile) && (
                  <div className="mt-2">
                    <div className="relative inline-block">
                      {editingRitual.imageFile ? (
                        <Image
                          src={URL.createObjectURL(editingRitual.imageFile)}
                          alt="Ritual image preview"
                          width={128}
                          height={128}
                          className="object-cover rounded-lg border"
                        />
                      ) : editingRitual.imageUrl ? (
                        <Image
                          src={editingRitual.imageUrl}
                          alt="Current ritual image"
                          width={128}
                          height={128}
                          className="object-cover rounded-lg border"
                        />
                      ) : null}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {editingRitual.imageFile ? "New image selected" : "Current image"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features ({locales.find(l => l.code === activeTab)?.name})
              </label>
              <input
                type="text"
                value={(getLocalizedField(editingRitual.features) as string[]).join(", ")}
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
                value={editingRitual.timing[activeTab]}
                onChange={(e) => handleFieldChange("timing", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                placeholder="Enter timing information..."
              />
            </div>

            {/* Order and Status */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <input
                  type="number"
                  value={editingRitual.order}
                  onChange={(e) => handleFieldChange("order", parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
                  placeholder="Display order..."
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingRitual.isActive}
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
                className="flex items-center gap-2 px-4 py-2 bg-brand_primary text-gray-700 rounded-lg font-medium hover:bg-brand_primary/90 transition-colors disabled:opacity-50"
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
        /* Rituals Table */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ritual
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
                {rituals
                  .filter(ritual => showInactive || ritual.isActive)
                  .map((ritual) => {
                    return (
                      <tr key={ritual._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {ritual.imageUrl ? (
                              <Image
                                src={ritual.imageUrl}
                                alt={ritual.title.en}
                                width={40}
                                height={40}
                                className="rounded-lg object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-brand_primary/10 rounded-lg flex items-center justify-center mr-3">
                                <ImageIcon className="w-5 h-5 text-brand_primary" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {ritual.title.en}
                              </div>
                              <div className="text-xs text-gray-500">
                                {ritual.title.no} / {ritual.title.ne}
                              </div>
                            </div>
                          </div>
                        </td>
                     
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            ritual.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {ritual.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleActive(ritual)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title={ritual.isActive ? "Deactivate" : "Activate"}
                            >
                              {ritual.isActive ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                            </button>
                            <button
                              onClick={() => startEdit(ritual)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDelete(ritual._id!)}
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

          {rituals.filter(ritual => showInactive || ritual.isActive).length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rituals found</h3>
              <p className="text-gray-500 mb-4">
                {showInactive ? "No inactive rituals found" : "Get started by creating your first ritual"}
              </p>
              {!showInactive && (
                <button
                  onClick={startCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand_primary text-white rounded-lg font-medium hover:bg-brand_primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Ritual
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
