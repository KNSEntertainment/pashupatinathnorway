"use client";

import dynamic from "next/dynamic";

// Dynamically import the entire editor component to avoid loading on home page
const LazyEditor = dynamic(() => import("./LazyEditor"), { 
  ssr: false,
  loading: () => <div className="p-4 border rounded">Loading editor...</div>
});

// ✅ Props type
interface EditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
	return <LazyEditor value={value} onChange={onChange} placeholder={placeholder} />;
}
