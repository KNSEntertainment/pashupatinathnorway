// Simple flag icon component for language switcher
// Usage: <Flag country="np" />
import React from "react";

const flagMap: Record<string, string> = {
	np: "🇳🇵", // Nepal
	no: "🇳🇴", // Norway
	gb: "🇬🇧", // UK
};

export default function Flag({ country, size = 24 }: { country: "np" | "no" | "gb"; size?: number }) {
	return <span style={{ fontSize: size, lineHeight: 1 }}>{flagMap[country]}</span>;
}
