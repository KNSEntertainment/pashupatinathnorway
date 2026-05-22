"use client";

// ✅ Props type
interface LazyEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export default function LazyEditor({ value, onChange, placeholder }: LazyEditorProps) {
	// Simple textarea fallback since TipTap was removed
	return (
		<div className="border rounded overflow-hidden">
			<div className="border-b p-2 bg-gray-50 text-sm text-gray-600">
				Simple Text Editor
			</div>
			<textarea
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder || "Start writing..."}
				className="w-full p-3 min-h-[200px] focus:outline-none resize-none"
				rows={8}
			/>
		</div>
	);
}
