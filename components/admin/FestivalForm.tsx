"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";
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
  Image as ImageIcon,
  Calendar,
  MapPin
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface FestivalEvent {
  _id: string;
  eventname: string;
  eventdate: string;
  eventtime?: string;
  eventvenue?: string;
  eventposterUrl: string;
  memberPrice?: number;
  guestPrice?: number;
  allowGuestRegistration: boolean;
  registrationDeadline?: Date;
  maxAttendees?: number;
  festivalId?: string;
}

interface Festival {
  _id?: string;
  title: MultilingualField;
  description: MultilingualField;
  imageUrl?: string;
  imageFile?: File;
  features: MultilingualArray;
  timing: MultilingualField;
  highlight: boolean;
  order: number;
  isActive: boolean;
  updatedAt?: Date;
  events?: FestivalEvent[];
}

export default function FestivalForm() {
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
    features: { en: [], no: [], ne: [] },
    timing: { en: "", no: "", ne: "" },
    highlight: false,
    order: 0,
    isActive: true
  };

  const fetchFestivals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/festivals?edit=true&locale=${locale}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch events for each festival
        const festivalsWithEvents = await Promise.all(
          (Array.isArray(data) ? data : data.festivals || []).map(async (festival: Festival) => {
            try {
              const eventsResponse = await fetch(`/api/events?locale=${locale}`);
              if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                const festivalEvents = eventsData.events?.filter((event: FestivalEvent) => 
                  event.festivalId === festival._id
                ) || [];
                
                return {
                  ...festival,
                  events: festivalEvents
                };
              }
              return festival;
            } catch (error) {
              console.error("Error fetching events for festival:", error);
              return festival;
            }
          })
        );
        
        setFestivals(festivalsWithEvents);
      }
    } catch (error) {
      console.error('Error fetching festivals:', error);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

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

    if (!editingFestival.title.en.trim() || !editingFestival.description.en.trim()) {
      toast.error("English title and description are required");
      return;
    }

    try {
      setLoading(true);
      const url = editingFestival._id ? "/api/festivals" : "/api/festivals";
      const method = editingFestival._id ? "PUT" : "POST";

      const formData = new FormData();
      
      formData.append("title", JSON.stringify(editingFestival.title));
      formData.append("description", JSON.stringify(editingFestival.description));
      formData.append("features", JSON.stringify(editingFestival.features));
      formData.append("timing", JSON.stringify(editingFestival.timing));
      formData.append("highlight", editingFestival.highlight.toString());
      formData.append("order", editingFestival.order.toString());
      formData.append("isActive", editingFestival.isActive.toString());
      
      if (editingFestival.imageFile) {
        formData.append("image", editingFestival.imageFile);
      }
      
      if (editingFestival._id) {
        formData.append("id", editingFestival._id);
      }

      const response = await fetch(url, {
        method,
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Festival ${editingFestival._id ? "updated" : "created"} successfully!`);
        setEditingFestival(null);
        setIsCreating(false);
        await fetchFestivals();
      } else {
        toast.error(data.error || `Failed to ${editingFestival._id ? "update" : "create"} festival`);
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
        const data = await response.json();
        toast.error(data.error || "Failed to delete festival");
      }
    } catch (error) {
      toast.error(`Failed to delete festival: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (festival: Festival) => {
    const festivalCopy = {
      ...festival,
      imageUrl: festival.imageUrl || undefined,
      imageFile: undefined
    };
    setEditingFestival(festivalCopy);
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

  const getLocalizedField = (field: MultilingualField | MultilingualArray): string | string[] => {
    if (Array.isArray(field)) {
      return field[activeTab] || field.en || [];
    }
    return field[activeTab] || field.en || "";
  };

  const getEventStatus = (eventDate: string) => {
    const date = new Date(eventDate);
    const now = new Date();
    return date >= now ? "upcoming" : "past";
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

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Festival Image</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditingFestival(prev => ({
                          ...prev!,
                          imageFile: file
                        }));
                      }
                    }}
                    className="hidden"
                    id="festival-image-upload"
                  />
                  <label
                    htmlFor="festival-image-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Choose Image</span>
                  </label>
                </div>
                
                <div className="mt-3">
                  {editingFestival.imageUrl || editingFestival.imageFile ? (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        {editingFestival.imageFile ? (
                          <div>
                            <Image
                              src={URL.createObjectURL(editingFestival.imageFile)}
                              alt="Festival image preview"
                              width={160}
                              height={160}
                              className="w-40 h-40 object-cover rounded-lg border-2 border-blue-500 shadow-sm"
                              unoptimized
                            />
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              New Image
                            </div>
                          </div>
                        ) : editingFestival.imageUrl ? (
                          <div className="relative">
                            <Image
                              src={editingFestival.imageUrl}
                              alt="Current festival image"
                              width={160}
                              height={160}
                              className="w-40 h-40 object-cover rounded-lg border-2 border-brand_primary/20 shadow-sm"
                            />
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Current Image
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <div className="text-sm text-gray-500">
                        <div>No image uploaded</div>
                        <div className="text-xs">Choose an image above to add one</div>
                      </div>
                    </div>
                  )}
                </div>
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

            {/* Associated Events Section */}
            {editingFestival._id && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Events</h3>
                {editingFestival.events && editingFestival.events.length > 0 ? (
                  <div className="space-y-3">
                    {editingFestival.events.map((event) => (
                      <div key={event._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={event.eventposterUrl}
                            alt={event.eventname}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{event.eventname}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(event.eventdate).toLocaleDateString()} • {event.eventtime || "No time"}
                          </div>
                          {event.eventvenue && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.eventvenue}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={getEventStatus(event.eventdate) === "upcoming" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {getEventStatus(event.eventdate) === "upcoming" ? "Upcoming" : "Past"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="text-sm text-gray-500 text-center pt-2">
                      {editingFestival.events.length} event{editingFestival.events.length !== 1 ? 's' : ''} associated with this festival
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No events associated with this festival yet.</p>
                    <p className="text-sm">Events can be linked to this festival from the Events Management page.</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : (isCreating ? "Create" : "Update")}
              </Button>
              <Button
                variant="outline"
                onClick={cancelEdit}
              >
                Cancel
              </Button>
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
                    Events
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
                  .map((festival) => (
                    <tr key={`festival-${festival._id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {festival.imageUrl ? (
                            <div className={`w-12 h-12 rounded-lg overflow-hidden ${
                              festival.highlight
                                ? "ring-2 ring-purple-600 ring-offset-2"
                                : ""
                            }`}>
                              <Image
                                src={festival.imageUrl}
                                alt={festival.title.en}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              festival.highlight
                                ? "bg-gradient-to-br from-purple-600 to-pink-600"
                                : "bg-gray-100"
                            }`}>
                              <ImageIcon className={`w-6 h-6 ${festival.highlight ? "text-white" : "text-gray-400"}`} />
                            </div>
                          )}
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900">
                            {festival.events?.length || 0} event{(festival.events?.length || 0) !== 1 ? 's' : ''}
                          </span>
                          {(festival.events?.length || 0) > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {festival.events?.filter((e: FestivalEvent) => getEventStatus(e.eventdate) === "upcoming").length || 0} upcoming
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          festival.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {festival.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
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
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
