"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  onDelete?: () => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  showDelete?: boolean;
}

export function EditableText({ 
  value, 
  onSave, 
  onDelete,
  className = "", 
  multiline = false,
  showDelete = false
}: EditableTextProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  // Only show edit functionality to admins
  const isAdmin = session?.user?.role === "admin";

  const handleSave = async () => {
    if (editValue.trim() === "") return;
    
    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      // Revert to original value on error
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm("Are you sure you want to delete this content?")) {
      await onDelete();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (!isAdmin) {
    // Regular users see plain text
    return multiline ? (
      <p className={className}>{value}</p>
    ) : (
      <span className={className}>{value}</span>
    );
  }

  if (isEditing) {
    return (
      <div className="relative w-full">
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full p-3 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] ${className}`}
            autoFocus
            rows={5}
            disabled={isSaving}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full p-2 border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
            autoFocus
            disabled={isSaving}
            style={{ width: '100%', boxSizing: 'border-box' }}
          />
        )}
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 shadow-sm"
          >
            {isSaving ? "..." : "✓"}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 shadow-sm"
          >
            ✕
          </button>
          {showDelete && onDelete && (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 shadow-sm"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <span 
      className={`group relative cursor-pointer hover:bg-blue-50 rounded transition-colors inline-block w-full ${className}`}
      onClick={() => setIsEditing(true)}
    >
      {multiline ? (
        <span className="block">{value}</span>
      ) : (
        <span>{value}</span>
      )}
      {/* Edit indicator for admins */}
      <span className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <span className="text-xs text-blue-500 bg-white px-1 rounded shadow">✏️</span>
        {showDelete && onDelete && (
          <span className="text-xs text-red-500 bg-white px-1 rounded shadow">🗑️</span>
        )}
      </span>
    </span>
  );
}
