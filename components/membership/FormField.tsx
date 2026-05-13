// components/membership/FormField.tsx
import React from "react";

interface FormFieldProps {
	label: string;
	required?: boolean;
	error?: string;
	children: React.ReactNode;
	className?: string;
}

export function FormField({ label, required, error, children, className = "" }: FormFieldProps) {
	return (
		<div className={className}>
			<label className="block text-sm font-medium text-gray-900 mb-2">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</label>
			{children}
			{error && <p className="text-red-600 text-sm mt-1">{error}</p>}
		</div>
	);
}

// A standard text input with consistent error-border styling
interface StyledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	hasError?: boolean;
	isSuccess?: boolean;
	inputSize?: "sm" | "md";
}

export function StyledInput({
	hasError,
	isSuccess,
	inputSize = "md",
	className = "",
	...props
}: StyledInputProps) {
	const padding = inputSize === "sm" ? "px-3 py-2" : "px-4 py-2";
	const border = hasError
		? "border-red-500"
		: isSuccess
		? "border-green-500"
		: "border-light";

	return (
		<input
			className={`w-full ${padding} border ${border} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
			{...props}
		/>
	);
}