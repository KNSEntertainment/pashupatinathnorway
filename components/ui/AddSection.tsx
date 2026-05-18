"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface AddSectionProps {
  onAdd: (title: string, content: string) => void;
}

export function AddSection({ onAdd }: AddSectionProps) {
  const { data: session } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Only show add functionality to admins
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin) return null;

  const handleAdd = async () => {
    if (title.trim() === "" || content.trim() === "") return;
    
    setIsSaving(true);
    try {
      await onAdd(title.trim(), content.trim());
      setTitle("");
      setContent("");
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add section:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <div className="mt-8 text-center">
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <span className="mr-2">+</span>
          Add New Section
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Section</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter section title..."
            disabled={isSaving}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
            placeholder="Enter section content..."
            rows={4}
            disabled={isSaving}
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={isSaving || title.trim() === "" || content.trim() === ""}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? "Adding..." : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
}
