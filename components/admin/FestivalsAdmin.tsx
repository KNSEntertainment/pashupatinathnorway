// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { useLocale } from "next-intl";
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Save, 
//   X, 
//   RefreshCw,
//   Clock,
//   Eye,
//   EyeOff,
//   Upload,
//   Image as ImageIcon
// } from "lucide-react";
// import { toast } from "react-hot-toast";

// interface MultilingualField {
//   en: string;
//   no: string;
//   ne: string;
// }

// interface MultilingualArray {
//   en: string[];
//   no: string[];
//   ne: string[];
// }

// interface Festival {
//   _id?: string;
//   title: MultilingualField;
//   description: MultilingualField;
//   imageUrl?: string;
//   imageFile?: File;
//   features: MultilingualArray;
//   timing: MultilingualField;
//   highlight: boolean;
//   order: number;
//   isActive: boolean;
//   updatedAt?: Date;
// }


// export default function FestivalsAdmin() {
//   const locale = useLocale();
//   const [festivals, setFestivals] = useState<Festival[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [editingFestival, setEditingFestival] = useState<Festival | null>(null);
//   const [isCreating, setIsCreating] = useState(false);
//   const [activeTab, setActiveTab] = useState<"en" | "no" | "ne">("en");
//   const [showInactive, setShowInactive] = useState(false);

//   const locales = [
//     { code: "en", name: "English", flag: "🇬🇧" },
//     { code: "no", name: "Norwegian", flag: "🇳🇴" },
//     { code: "ne", name: "Nepali", flag: "🇳🇵" }
//   ];

//   const emptyFestival: Festival = {
//     title: { en: "", no: "", ne: "" },
//     description: { en: "", no: "", ne: "" },
//     features: { en: [], no: [], ne: [] },
//     timing: { en: "", no: "", ne: "" },
//     highlight: false,
//     order: 0,
//     isActive: true
//   };

//   const fetchFestivals = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/festivals?edit=true&locale=${locale}`);
//       if (response.ok) {
//         const data = await response.json();
//         setFestivals(Array.isArray(data) ? data : data.festivals || []);
//       }
//     } catch (error) {
//       console.error('Error fetching festivals:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [locale]);

//   useEffect(() => {
//     fetchFestivals();
//   }, [fetchFestivals]);

//   // Refresh data when component mounts to prevent stale data
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetchFestivals();
//     }, 30000); // Refresh every 30 seconds

//     return () => clearInterval(interval);
//   }, [fetchFestivals]);

//   const handleFieldChange = (field: keyof Festival, value: string | boolean | number | MultilingualField | MultilingualArray) => {
//     if (!editingFestival) return;

//     if (field === "features") {
//       const localeValue = value as string;
//       setEditingFestival(prev => ({
//         ...prev!,
//         features: {
//           ...prev!.features,
//           [activeTab]: localeValue.split(",").map(item => item.trim()).filter(Boolean)
//         }
//       }));
//     } else if (field === "title" || field === "description" || field === "timing") {
//       setEditingFestival(prev => ({
//         ...prev!,
//         [field]: {
//           ...prev![field] as MultilingualField,
//           [activeTab]: value
//         }
//       }));
//     } else {
//       setEditingFestival(prev => ({
//         ...prev!,
//         [field]: value
//       }));
//     }
//   };

//   const handleSave = async () => {
//     if (!editingFestival) return;

//     // Validate required fields
//     if (!editingFestival.title.en.trim() || !editingFestival.description.en.trim()) {
//       toast.error("English title and description are required");
//       return;
//     }

//     try {
//       setLoading(true);
//       const url = editingFestival._id 
//         ? "/api/festivals" 
//         : "/api/festivals";
//       const method = editingFestival._id ? "PUT" : "POST";

//       console.log("💾 Save operation:", { method, url, id: editingFestival._id });

//       // Create FormData for image upload
//       const formData = new FormData();
      
//       // Add all fields to FormData
//       formData.append("title", JSON.stringify(editingFestival.title));
//       formData.append("description", JSON.stringify(editingFestival.description));
//       formData.append("features", JSON.stringify(editingFestival.features));
//       formData.append("timing", JSON.stringify(editingFestival.timing));
//       formData.append("highlight", editingFestival.highlight.toString());
//       formData.append("order", editingFestival.order.toString());
//       formData.append("isActive", editingFestival.isActive.toString());
      
//       // Add image if available
//       if (editingFestival.imageFile) {
//         formData.append("image", editingFestival.imageFile);
//       }
      
//       // For PUT requests, include the id
//       if (editingFestival._id) {
//         formData.append("id", editingFestival._id);
//         console.log("📝 Adding ID to FormData:", editingFestival._id);
//       }

//       console.log("📤 Sending FormData request...");
      
//       const response = await fetch(url, {
//         method,
//         body: formData
//       });

//       console.log("📊 Response status:", response.status, response.statusText);
//       console.log("📋 Response headers:", Object.fromEntries(response.headers.entries()));

//       let data;
//       let responseText;
//       try {
//         responseText = await response.text();
//         console.log("📄 Raw response text:", responseText);
        
//         if (responseText.trim() === '') {
//           console.error("❌ Empty response received");
//           data = { error: "Empty response from server" };
//         } else {
//           try {
//             data = JSON.parse(responseText);
//             console.log("📦 Parsed response data:", data);
//           } catch (jsonError) {
//             console.error("❌ JSON parse error:", jsonError);
//             console.log("📄 Response that failed to parse:", responseText);
//             data = { error: "Invalid JSON response", rawResponse: responseText };
//           }
//         }
//       } catch (textError) {
//         console.error("❌ Failed to read response text:", textError);
//         data = { error: "Failed to read response" };
//       }

//       if (response.ok) {
//         toast.success(`Festival ${editingFestival._id ? "updated" : "created"} successfully!`);
        
//         // Log successful update for debugging
//         console.log("✅ Festival saved successfully:", {
//           id: editingFestival._id,
//           hasNewImage: !!editingFestival.imageFile,
//           imageUrl: data?.data?.imageUrl || data?.imageUrl
//         });
        
//         // Clear the editing state and refresh data
//         setEditingFestival(null);
//         setIsCreating(false);
//         await fetchFestivals(); // Ensure data is refreshed
//       } else {
//         console.error("❌ Save failed:", data);
        
//         let errorMessage = data?.error || `Failed to ${editingFestival._id ? "update" : "create"} festival`;
        
//         // Handle empty or undefined error
//         if (!errorMessage || errorMessage.trim() === '') {
//           errorMessage = `Save failed with status ${response.status}. Check console for details.`;
//         }
        
//         toast.error(errorMessage);
//       }
//     } catch {
//       toast.error(`Failed to ${editingFestival._id ? "update" : "create"} festival`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     console.log("🗑️ Delete attempt for festival ID:", id);
    
//     if (!confirm("Are you sure you want to delete this festival?")) return;

//     try {
//       setLoading(true);
//       console.log("📡 Sending DELETE request to:", `/api/festivals?id=${id}`);
      
//       const response = await fetch(`/api/festivals?id=${id}`, {
//         method: "DELETE"
//       });

//       console.log("📊 Response status:", response.status, response.statusText);
      
//       let data;
//       try {
//         data = await response.json();
//         console.log("📦 Response data:", data);
//       } catch (jsonError) {
//         console.error("❌ JSON parse error:", jsonError);
//         const text = await response.text();
//         console.log("📄 Raw response:", text);
//         data = { error: "Invalid response format" };
//       }

//       if (response.ok) {
//         toast.success("Festival deleted successfully!");
//         fetchFestivals();
//       } else {
//         console.error("❌ Delete failed:", data);
//         if (data.error?.includes("not found")) {
//           toast.error("Festival not found. Refreshing data...");
//           fetchFestivals();
//         } else if (data.error?.includes("Unauthorized")) {
//           toast.error("You must be logged in as admin to delete festivals");
//         } else {
//           let errorMessage = data.error || `Failed to delete festival (Status: ${response.status})`;
          
//           // Handle empty or undefined error
//           if (!errorMessage || errorMessage.trim() === '') {
//             errorMessage = `Delete failed with status ${response.status}. Please check browser console for details.`;
//           }
          
//           toast.error(errorMessage);
//         }
//       }
//     } catch (error) {
//       console.error("❌ Delete error:", error);
//       toast.error(`Failed to delete festival: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleActive = async (festival: Festival) => {
//     try {
//       setLoading(true);
//       const updatedFestival = { ...festival, isActive: !festival.isActive };
      
//       console.log("🔄 Toggle active for festival:", updatedFestival._id);
//       console.log("📤 Sending data:", { ...updatedFestival, id: updatedFestival._id });
      
//       const response = await fetch("/api/festivals", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ ...updatedFestival, id: updatedFestival._id })
//       });

//       console.log("📊 Response status:", response.status, response.statusText);
      
//       const data = await response.json();
//       console.log("📦 Response data:", data);

//       if (response.ok) {
//         toast.success(`Festival ${updatedFestival.isActive ? "activated" : "deactivated"} successfully!`);
//         fetchFestivals();
//       } else {
//         console.error("❌ Update failed:", data);
//         toast.error(data.error || "Failed to update festival status");
//       }
//     } catch (error) {
//       console.error("❌ Update error:", error);
//       toast.error("Failed to update festival status");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (festival: Festival) => {
//     // Ensure we preserve all fields including imageUrl
//     const festivalCopy = {
//       ...festival,
//       imageUrl: festival.imageUrl || undefined,
//       imageFile: undefined // Clear any previous file selection
//     };
//     console.log("🔄 Starting edit for festival:", {
//       id: festival._id,
//       title: festival.title.en,
//       hasImage: !!festival.imageUrl
//     });
//     setEditingFestival(festivalCopy);
//     setIsCreating(false);
//   };

//   const startCreate = () => {
//     setEditingFestival({ ...emptyFestival });
//     setIsCreating(true);
//   };

//   const cancelEdit = () => {
//     setEditingFestival(null);
//     setIsCreating(false);
//   };

  
//   const getLocalizedField = (field: MultilingualField | MultilingualArray): string | string[] => {
//     if (Array.isArray(field)) {
//       return field[activeTab] || field.en || [];
//     }
//     return field[activeTab] || field.en || "";
//   };

//   if (loading && festivals.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <RefreshCw className="w-8 h-8 animate-spin text-brand_primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Festivals Management</h1>
//           <p className="text-gray-600 mt-1">Manage temple festivals and celebrations in multiple languages</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => setShowInactive(!showInactive)}
//             className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//               showInactive
//                 ? "bg-gray-100 text-gray-700"
//                 : "bg-brand_primary text-gray-600"
//             }`}
//           >
//             {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//             {showInactive ? "Hide Inactive" : "Show Inactive"}
//           </button>
//           <button
//             onClick={startCreate}
//             className="flex items-center gap-2 px-4 py-2 bg-brand_primary text-gray-600 rounded-lg font-medium hover:bg-brand_primary/90 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Add Festival
//           </button>
//         </div>
//       </div>

//       {editingFestival ? (
//         /* Edit/Create Form */
//         <div className="bg-white rounded-xl border border-gray-200 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-xl font-semibold text-gray-900">
//               {isCreating ? "Create New Festival" : "Edit Festival"}
//             </h2>
//             <button
//               onClick={cancelEdit}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <X className="w-5 h-5 text-gray-500" />
//             </button>
//           </div>

//           {/* Language Tabs */}
//           <div className="flex gap-2 mb-6">
//             {locales.map(locale => (
//               <button
//                 key={locale.code}
//                 onClick={() => setActiveTab(locale.code as "en" | "no" | "ne")}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                   activeTab === locale.code
//                     ? "bg-brand_primary text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 <span>{locale.flag}</span>
//                 <span>{locale.name}</span>
//               </button>
//             ))}
//           </div>

//           <div className="grid gap-6">
//             {/* Title */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Title ({locales.find(l => l.code === activeTab)?.name})
//               </label>
//               <input
//                 type="text"
//                 value={editingFestival.title[activeTab]}
//                 onChange={(e) => handleFieldChange("title", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
//                 placeholder="Enter festival title..."
//               />
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Description ({locales.find(l => l.code === activeTab)?.name})
//               </label>
//               <textarea
//                 value={editingFestival.description[activeTab]}
//                 onChange={(e) => handleFieldChange("description", e.target.value)}
//                 rows={3}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
//                 placeholder="Enter festival description..."
//               />
//             </div>

//             {/* Image Upload */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Festival Image</label>
//               <div className="space-y-2">
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (file) {
//                         console.log("📷 New image file selected:", file.name);
//                         setEditingFestival(prev => ({
//                           ...prev!,
//                           imageFile: file
//                         }));
//                       }
//                     }}
//                     className="hidden"
//                     id="festival-image-upload"
//                   />
//                   <label
//                     htmlFor="festival-image-upload"
//                     className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
//                   >
//                     <Upload className="w-4 h-4" />
//                     <span className="text-sm">Choose Image</span>
//                   </label>
//                 </div>
                
//                 {/* Show current image or uploaded image preview */}
//                 <div className="mt-3">
//                   {editingFestival.imageUrl || editingFestival.imageFile ? (
//                     <div className="space-y-2">
//                       <div className="relative inline-block">
//                         {editingFestival.imageFile ? (
//                           <div>
//                             <img
//                               src={URL.createObjectURL(editingFestival.imageFile)}
//                               alt="Festival image preview"
//                               className="w-40 h-40 object-cover rounded-lg border-2 border-blue-500 shadow-sm"
//                             />
//                             <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
//                               New Image
//                             </div>
//                           </div>
//                         ) : editingFestival.imageUrl ? (
//                           <div className="relative">
//                             <img
//                               src={editingFestival.imageUrl}
//                               alt="Current festival image"
//                               className="w-40 h-40 object-cover rounded-lg border-2 border-brand_primary/20 shadow-sm"
//                             />
//                             <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
//                               Current Image
//                             </div>
//                           </div>
//                         ) : null}
//                       </div>
//                       <div className="flex items-center gap-2 text-sm">
//                         {editingFestival.imageFile ? (
//                           <>
//                             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
//                             <span className="text-blue-600 font-medium">New image selected - will replace current after save</span>
//                           </>
//                         ) : editingFestival.imageUrl ? (
//                           <>
//                             <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                             <span className="text-green-600">Current festival image</span>
//                           </>
//                         ) : null}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
//                       <ImageIcon className="w-8 h-8 text-gray-400" />
//                       <div className="text-sm text-gray-500">
//                         <div>No image uploaded</div>
//                         <div className="text-xs">Choose an image above to add one</div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Features */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Features ({locales.find(l => l.code === activeTab)?.name})
//               </label>
//               <input
//                 type="text"
//                 value={(getLocalizedField(editingFestival.features) as string[]).join(", ")}
//                 onChange={(e) => handleFieldChange("features", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
//                 placeholder="Enter features separated by commas..."
//               />
//               <p className="text-xs text-gray-500 mt-1">Separate multiple features with commas</p>
//             </div>

//             {/* Timing */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Timing ({locales.find(l => l.code === activeTab)?.name})
//               </label>
//               <input
//                 type="text"
//                 value={editingFestival.timing[activeTab]}
//                 onChange={(e) => handleFieldChange("timing", e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
//                 placeholder="Enter timing information..."
//               />
//             </div>

//             {/* Order, Highlight and Status */}
//             <div className="flex gap-4">
//               <div className="flex-1">
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
//                 <input
//                   type="number"
//                   value={editingFestival.order}
//                   onChange={(e) => handleFieldChange("order", parseInt(e.target.value) || 0)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand_primary focus:border-transparent"
//                   placeholder="Display order..."
//                 />
//               </div>
//               <div className="flex items-center gap-4">
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={editingFestival.highlight}
//                     onChange={(e) => handleFieldChange("highlight", e.target.checked)}
//                     className="w-4 h-4 text-brand_primary border-gray-300 rounded focus:ring-brand_primary"
//                   />
//                   <span className="text-sm font-medium text-gray-700">Featured</span>
//                 </label>
//                 <label className="flex items-center gap-2 cursor-pointer">
//                   <input
//                     type="checkbox"
//                     checked={editingFestival.isActive}
//                     onChange={(e) => handleFieldChange("isActive", e.target.checked)}
//                     className="w-4 h-4 text-brand_primary border-gray-300 rounded focus:ring-brand_primary"
//                   />
//                   <span className="text-sm font-medium text-gray-700">Active</span>
//                 </label>
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex gap-3 pt-4">
//               <button
//                 onClick={handleSave}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-4 py-2 bg-brand_primary text-gray-700 rounded-lg font-medium hover:bg-brand_primary/90 transition-colors disabled:opacity-50"
//               >
//                 <Save className="w-4 h-4" />
//                 {loading ? "Saving..." : (isCreating ? "Create" : "Update")}
//               </button>
//               <button
//                 onClick={cancelEdit}
//                 className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         /* Festivals Table */
//         <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Festival
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Description
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Timing
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Featured
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Order
//                   </th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {festivals
//                   .filter(festival => showInactive || festival.isActive)
//                   .map((festival) => {
//                     return (
//                       <tr key={`festival-${festival._id}`} className="hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center justify-center">
//                             {festival.imageUrl ? (
//                               <div className={`w-12 h-12 rounded-lg overflow-hidden ${
//                                 festival.highlight
//                                   ? "ring-2 ring-purple-600 ring-offset-2"
//                                   : ""
//                               }`}>
//                                 <img
//                                   src={festival.imageUrl}
//                                   alt={festival.title.en}
//                                   className="w-full h-full object-cover"
//                                 />
//                               </div>
//                             ) : (
//                               <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
//                                 festival.highlight
//                                   ? "bg-gradient-to-br from-purple-600 to-pink-600"
//                                   : "bg-gray-100"
//                               }`}>
//                                 <ImageIcon className={`w-6 h-6 ${festival.highlight ? "text-white" : "text-gray-400"}`} />
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div>
//                             <div className="text-sm font-medium text-gray-900">
//                               {festival.title.en}
//                             </div>
//                             <div className="text-xs text-gray-500">
//                               {festival.title.no} / {festival.title.ne}
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="text-sm text-gray-900 max-w-xs truncate">
//                             {festival.description.en}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center text-sm text-gray-900">
//                             <Clock className="w-4 h-4 mr-1 text-gray-400" />
//                             {festival.timing.en || "-"}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {festival.highlight && (
//                             <div className="flex items-center text-sm text-purple-600">
//                               <ImageIcon className="w-4 h-4 mr-1" />
//                               Featured
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {festival.order}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                             festival.isActive
//                               ? "bg-green-100 text-green-800"
//                               : "bg-red-100 text-red-800"
//                           }`}>
//                             {festival.isActive ? "Active" : "Inactive"}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                           <div className="flex items-center justify-end gap-2">
//                             <button
//                               onClick={() => handleToggleActive(festival)}
//                               className="p-1 hover:bg-gray-100 rounded transition-colors"
//                               title={festival.isActive ? "Deactivate" : "Activate"}
//                             >
//                               {festival.isActive ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
//                             </button>
//                             <button
//                               onClick={() => startEdit(festival)}
//                               className="p-1 hover:bg-gray-100 rounded transition-colors"
//                               title="Edit"
//                             >
//                               <Edit className="w-4 h-4 text-gray-500" />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(festival._id!)}
//                               className="p-1 hover:bg-red-50 rounded transition-colors"
//                               title="Delete"
//                             >
//                               <Trash2 className="w-4 h-4 text-red-500" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//               </tbody>
//             </table>
//           </div>

//           {festivals.filter(festival => showInactive || festival.isActive).length === 0 && (
//             <div className="text-center py-12">
//               <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No festivals found</h3>
//               <p className="text-gray-500 mb-4">
//                 {showInactive ? "No inactive festivals found" : "Get started by creating your first festival"}
//               </p>
//               {!showInactive && (
//                 <button
//                   onClick={startCreate}
//                   className="inline-flex items-center gap-2 px-4 py-2 bg-brand_primary text-white rounded-lg font-medium hover:bg-brand_primary/90 transition-colors"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Add Festival
//                 </button>
//               )}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

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
}

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
        setFestivals(Array.isArray(data) ? data : data.festivals || []);
      }
    } catch (error) {
      console.error("Error fetching festivals:", error);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  useEffect(() => {
    const interval = setInterval(fetchFestivals, 30000);
    return () => clearInterval(interval);
  }, [fetchFestivals]);

  const handleFieldChange = (
    field: keyof Festival,
    value: string | boolean | number | MultilingualField | MultilingualArray
  ) => {
    if (!editingFestival) return;

    if (field === "features") {
      // value is the raw comma-separated string from the input
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
          ...(prev![field] as MultilingualField),
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

  /**
   * Build a FormData payload for both POST and PUT requests.
   * FIX: Always append existingImageUrl so the server can preserve
   * the current image when no new file is selected.
   */
  const buildFormData = (festival: Festival): FormData => {
    const formData = new FormData();

    formData.append("title", JSON.stringify(festival.title));
    formData.append("description", JSON.stringify(festival.description));
    formData.append("features", JSON.stringify(festival.features));
    formData.append("timing", JSON.stringify(festival.timing));
    formData.append("highlight", festival.highlight.toString());
    formData.append("order", festival.order.toString());
    formData.append("isActive", festival.isActive.toString());

    // Send the current stored URL so the server can fall back to it
    // when no new image file is uploaded
    if (festival.imageUrl) {
      formData.append("existingImageUrl", festival.imageUrl);
    }

    // Attach new image file if the user selected one
    if (festival.imageFile) {
      formData.append("image", festival.imageFile);
    }

    if (festival._id) {
      formData.append("id", festival._id);
    }

    return formData;
  };

  const handleSave = async () => {
    if (!editingFestival) return;

    if (!editingFestival.title.en.trim() || !editingFestival.description.en.trim()) {
      toast.error("English title and description are required");
      return;
    }

    try {
      setLoading(true);
      const method = editingFestival._id ? "PUT" : "POST";
      const formData = buildFormData(editingFestival);

      const response = await fetch("/api/festivals", { method, body: formData });

      let data: Record<string, unknown> = {};
      try {
        const text = await response.text();
        if (text.trim()) data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse response:", e);
      }

      if (response.ok) {
        toast.success(`Festival ${editingFestival._id ? "updated" : "created"} successfully!`);
        setEditingFestival(null);
        setIsCreating(false);
        await fetchFestivals();
      } else {
        toast.error((data.error as string) || `Failed to ${editingFestival._id ? "update" : "create"} festival`);
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
      const response = await fetch(`/api/festivals?id=${id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success("Festival deleted successfully!");
        fetchFestivals();
      } else {
        toast.error(data.error || `Failed to delete festival (Status: ${response.status})`);
      }
    } catch (error) {
      toast.error(`Failed to delete festival: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * FIX: Was sending JSON which made the server parse body.imageUrl as undefined
   * (since the PUT handler extracts imageUrl from formData, not JSON body).
   * Now uses the same FormData builder so imageUrl is always preserved.
   */
  const handleToggleActive = async (festival: Festival) => {
    try {
      setLoading(true);
      const toggled: Festival = { ...festival, isActive: !festival.isActive };
      const formData = buildFormData(toggled);

      const response = await fetch("/api/festivals", { method: "PUT", body: formData });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        toast.success(`Festival ${toggled.isActive ? "activated" : "deactivated"} successfully!`);
        fetchFestivals();
      } else {
        toast.error(data.error || "Failed to update festival status");
      }
    } catch {
      toast.error("Failed to update festival status");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (festival: Festival) => {
    setEditingFestival({ ...festival, imageFile: undefined });
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

  /**
   * FIX: The old implementation used Array.isArray(field) which always returns
   * false for MultilingualArray objects like { en: [], no: [], ne: [] }.
   * Now correctly checks if the value at activeTab is an array.
   */
  const getLocalizedFeatures = (features: MultilingualArray): string[] => {
    const value = features[activeTab];
    return Array.isArray(value) ? value : features.en || [];
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
              showInactive ? "bg-gray-100 text-gray-700" : "bg-brand_primary text-gray-600"
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
            <button onClick={cancelEdit} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-6">
            {locales.map(loc => (
              <button
                key={loc.code}
                onClick={() => setActiveTab(loc.code as "en" | "no" | "ne")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === loc.code
                    ? "bg-brand_primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{loc.flag}</span>
                <span>{loc.name}</span>
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
                        setEditingFestival(prev => ({ ...prev!, imageFile: file }));
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
                  {/* Allow clearing a newly selected file without losing the stored one */}
                  {editingFestival.imageFile && (
                    <button
                      onClick={() => setEditingFestival(prev => ({ ...prev!, imageFile: undefined }))}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove new selection
                    </button>
                  )}
                </div>

                <div className="mt-3">
                  {editingFestival.imageFile ? (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        <Image
                          src={URL.createObjectURL(editingFestival.imageFile)}
                          alt="Festival image preview"
                          width={160}
                          height={160}
                          className="object-cover rounded-lg border-2 border-blue-500 shadow-sm"
                        />
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          New Image
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-blue-600 font-medium">
                          New image selected — will replace current after save
                        </span>
                      </div>
                    </div>
                  ) : editingFestival.imageUrl ? (
                    <div className="space-y-2">
                      <div className="relative inline-block">
                        <Image
                          src={editingFestival.imageUrl}
                          alt="Current festival image"
                          width={160}
                          height={160}
                          className="object-cover rounded-lg border-2 border-brand_primary/20 shadow-sm"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Current Image
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-green-600">Current festival image</span>
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

            {/* Features — FIX: use getLocalizedFeatures instead of broken getLocalizedField */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features ({locales.find(l => l.code === activeTab)?.name})
              </label>
              <input
                type="text"
                value={getLocalizedFeatures(editingFestival.features).join(", ")}
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
                className="flex items-center gap-2 px-4 py-2 bg-brand_primary text-gray-700 rounded-lg font-medium hover:bg-brand_primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : isCreating ? "Create" : "Update"}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Festival</th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {festivals
                  .filter(festival => showInactive || festival.isActive)
                  .map((festival) => (
                    <tr key={`festival-${festival._id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          {festival.imageUrl ? (
                            <div
                              className={`w-12 h-12 rounded-lg overflow-hidden relative ${
                                festival.highlight ? "ring-2 ring-purple-600 ring-offset-2" : ""
                              }`}
                            >
                              <Image
                                src={festival.imageUrl}
                                alt={festival.title.en}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                festival.highlight
                                  ? "bg-gradient-to-br from-purple-600 to-pink-600"
                                  : "bg-gray-100"
                              }`}
                            >
                              <ImageIcon className={`w-6 h-6 ${festival.highlight ? "text-white" : "text-gray-400"}`} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{festival.title.en}</div>
                          <div className="text-xs text-gray-500">
                            {festival.title.no} / {festival.title.ne}
                          </div>
                        </div>
                      </td>
                
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            festival.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
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
                            {festival.isActive
                              ? <EyeOff className="w-4 h-4 text-gray-500" />
                              : <Eye className="w-4 h-4 text-gray-500" />}
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
                  ))}
              </tbody>
            </table>
          </div>

          {festivals.filter(f => showInactive || f.isActive).length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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