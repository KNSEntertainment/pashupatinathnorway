import { useState, useRef, useEffect } from "react";
import { Mail, Clock, RefreshCw } from "lucide-react";

interface VerificationCodeInputProps {
	onVerify: (code: string) => void;
	onResend: () => void;
	email: string;
	loading?: boolean;
	error?: string;
	timeRemaining?: number;
}

export default function VerificationCodeInput({ onVerify, onResend, email, loading = false, error = "", timeRemaining = 120 }: VerificationCodeInputProps) {
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		// Focus first input on mount
		if (inputRefs.current[0]) {
			inputRefs.current[0].focus();
		}
	}, []);

	const handleChange = (index: number, value: string) => {
		// Only allow numbers
		const numericValue = value.replace(/[^0-9]/g, "");

		if (numericValue.length > 1) {
			// If pasting multiple digits, distribute them
			const digits = numericValue.slice(0, 6).split("");
			const newCode = ["", "", "", "", "", ""];
			digits.forEach((digit, i) => {
				if (index + i < 6) {
					newCode[index + i] = digit;
				}
			});
			setCode(newCode);

			// Focus the next empty input or the last filled one
			const nextEmptyIndex = newCode.findIndex((c) => c === "");
			const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
			if (inputRefs.current[focusIndex]) {
				inputRefs.current[focusIndex].focus();
			}

			// Auto-submit if all fields are filled
			if (newCode.every((c) => c !== "")) {
				onVerify(newCode.join(""));
			}
		} else {
			// Single digit input
			const newCode = [...code];
			newCode[index] = numericValue;
			setCode(newCode);

			// Move to next input if current is filled
			if (numericValue && index < 5 && inputRefs.current[index + 1]) {
				inputRefs.current[index + 1]?.focus();
			}

			// Auto-submit if all fields are filled
			if (newCode.every((c) => c !== "")) {
				onVerify(newCode.join(""));
			}
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
		if (e.key === "Backspace" && !code[index] && index > 0 && inputRefs.current[index - 1]) {
			// Move to previous input on backspace if current is empty
			inputRefs.current[index - 1]?.focus();
		} else if (e.key === "ArrowLeft" && index > 0 && inputRefs.current[index - 1]) {
			// Move left with arrow key
			inputRefs.current[index - 1]?.focus();
		} else if (e.key === "ArrowRight" && index < 5 && inputRefs.current[index + 1]) {
			// Move right with arrow key
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");

		if (pastedData.length > 0) {
			const digits = pastedData.slice(0, 6).split("");
			const newCode = ["", "", "", "", "", ""];
			digits.forEach((digit, i) => {
				newCode[i] = digit;
			});
			setCode(newCode);

			// Focus the next empty input or the last filled one
			const nextEmptyIndex = newCode.findIndex((c) => c === "");
			const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
			if (inputRefs.current[focusIndex]) {
				inputRefs.current[focusIndex]?.focus();
			}

			// Auto-submit if all fields are filled
			if (newCode.every((c) => c !== "")) {
				onVerify(newCode.join(""));
			}
		}
	};

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	const canResend = timeRemaining <= 0;

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<div className="text-center mb-6">
				<div className="flex justify-center mb-4">
					<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
						<Mail className="text-blue-600" size={24} />
					</div>
				</div>
				<h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Verification Code</h2>
				<p className="text-gray-600 text-sm">
					We&apos;ve sent a 6-digit code to <strong>{email}</strong>
				</p>
			</div>

			{/* Code Input Boxes */}
			<div className="flex justify-center gap-2 mb-6">
				{code.map((digit, index) => (
					<input
						key={index}
						ref={(el) => {
							inputRefs.current[index] = el;
						}}
						type="text"
						inputMode="numeric"
						maxLength={1}
						value={digit}
						onChange={(e) => handleChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						onPaste={handlePaste}
						disabled={loading}
						className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
						placeholder="0"
					/>
				))}
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
					<p className="text-brand_secondary text-sm text-center">{error}</p>
				</div>
			)}

			{/* Timer */}
			<div className="flex items-center justify-center gap-2 mb-6">
				<Clock className="text-gray-400" size={16} />
				<span className={`text-sm ${timeRemaining > 0 ? "text-gray-600" : "text-red-600"}`}>{timeRemaining > 0 ? `Code expires in ${formatTime(timeRemaining)}` : "Code has expired"}</span>
			</div>

			{/* Resend Button */}
			<div className="text-center">
				<button type="button" onClick={onResend} disabled={!canResend || loading} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${canResend && !loading ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : "text-gray-400 cursor-not-allowed"}`}>
					<RefreshCw size={16} />
					{timeRemaining > 0 ? `Resend in ${formatTime(timeRemaining)}` : "Didn't receive code? Resend"}
				</button>
			</div>

			{/* Helper Text */}
			<div className="mt-4 text-center">
				<p className="text-xs text-gray-500">Check your spam folder if you don&apos;t see the email in your inbox</p>
			</div>
		</div>
	);
}
