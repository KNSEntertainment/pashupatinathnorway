// components/membership/OTPModal.tsx
"use client";

import { useRef, useEffect } from "react";

interface OTPModalProps {
	show: boolean;
	phone: string;
	otpCode: string;
	otpSent: boolean;
	otpSending?: boolean;
	otpError: string;
	verifying: boolean;
	countdown: number;
	onOtpChange: (value: string) => void;
	onVerify: (code?: string) => void;
	onResend: () => void;
	onClose: () => void;
}

export function OTPModal({ show, phone, otpCode, otpSent, otpSending = false, otpError, verifying, countdown, onOtpChange, onVerify, onResend, onClose }: OTPModalProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus the input whenever the modal is shown and code has been sent
	useEffect(() => {
		if (show && otpSent && !otpSending) {
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [show, otpSent, otpSending]);

	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
			<div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-[420px] max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
				{/* Top-right close button */}
				<button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-20" aria-label="Close">
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				{/* Header */}
				<div className="px-6 pt-7 pb-4 border-b border-gray-100 flex flex-col items-center text-center">
					<div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
						<svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
					</div>
					<p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-1">Phone Verification</p>
					<h3 className="text-xl font-bold text-gray-900">Verify your mobile number</h3>
				</div>

				{/* Body */}
				<div className="p-6">
					{/* State 1: Sending in progress */}
					{otpSending && (
						<div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
							<div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
							<p className="text-sm font-medium text-gray-700">
								Sending verification code to <span className="font-semibold text-gray-900">+47 {phone}</span>...
							</p>
						</div>
					)}

					{/* State 2: Send failed and not sending */}
					{!otpSending && !otpSent && (
						<div className="space-y-4">
							<div className="p-4 bg-red-50 border border-red-200 rounded-xl">
								<div className="flex items-start gap-3">
									<svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<div>
										<h4 className="text-sm font-semibold text-red-800">Failed to send SMS code</h4>
										<p className="text-xs text-red-700 mt-1 leading-relaxed">{otpError || "Unable to send verification code. Please check your phone number and try again."}</p>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-2 pt-2">
								<button type="button" onClick={onResend} className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
									Retry sending code
								</button>
								<button type="button" onClick={onClose} className="w-full py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
									Back to form
								</button>
							</div>
						</div>
					)}

					{/* State 3: Code sent successfully */}
					{!otpSending && otpSent && (
						<div className="space-y-5">
							<p className="text-sm text-gray-600 text-center leading-relaxed">
								Enter the 4-digit verification code sent to <span className="font-semibold text-gray-900 whitespace-nowrap">+47 {phone}</span>:
							</p>

							{/* 4-digit Boxed Input Container */}
							<div className="space-y-3">
								<div className="relative flex justify-center items-center gap-2 sm:gap-3 py-2 cursor-pointer" onClick={() => inputRef.current?.focus()}>
									{/* Transparent accessible input covering the boxes */}
									<input
										ref={inputRef}
										type="text"
										inputMode="numeric"
										pattern="[0-9]*"
										autoComplete="one-time-code"
										maxLength={4}
										value={otpCode}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, "").slice(0, 4);
											onOtpChange(value);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" && otpCode.length === 4 && !verifying) {
												e.preventDefault();
												onVerify(otpCode);
											}
										}}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 select-none text-transparent"
										aria-label="4-digit verification code"
										autoFocus
									/>

									{/* 4 visual digit boxes */}
									{[0, 1, 2, 3].map((index) => {
										const digit = otpCode[index] || "";
										const isCurrent = otpCode.length === index;
										const isFilled = Boolean(digit);

										return (
											<div key={index} className={`w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-bold font-mono rounded-xl border-2 transition-all duration-150 select-none ${isFilled ? "border-blue-600 bg-blue-50/20 text-gray-900 shadow-xs" : isCurrent ? "border-blue-500 ring-4 ring-blue-100 bg-white text-gray-900" : "border-gray-200 bg-gray-50/60 text-gray-300"}`}>
												{digit ? <span>{digit}</span> : isCurrent ? <span className="w-0.5 h-6 bg-blue-500 animate-pulse" /> : <span className="text-gray-300 font-normal text-xl">•</span>}
											</div>
										);
									})}
								</div>

								{/* Error display */}
								{otpError && (
									<div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm font-medium">
										<svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<p className="flex-1">{otpError}</p>
									</div>
								)}

								{/* Prominent Stacked Full-Width Verify Button */}
								<div className="pt-2">
									<button type="button" onClick={() => onVerify(otpCode)} disabled={otpCode.length !== 4 || verifying} className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 text-base">
										{verifying ? (
											<>
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												<span>Verifying...</span>
											</>
										) : (
											"Verify & Submit"
										)}
									</button>
								</div>
							</div>

							{/* Secondary Actions */}
							<div className="flex justify-between items-center pt-2 text-sm border-t border-gray-100">
								<button type="button" onClick={onResend} disabled={countdown > 0} className={`font-medium transition-colors ${countdown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"}`}>
									{countdown > 0 ? `Resend code (${countdown}s)` : "Resend code"}
								</button>
								<button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
									Cancel
								</button>
							</div>

							<div className="pt-1">
								<button type="button" onClick={onClose} className="w-full py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
									Back to form
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
