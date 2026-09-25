// components/membership/OTPModal.tsx
"use client";

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
	onVerify: () => void;
	onResend: () => void;
	onClose: () => void;
}

export function OTPModal({
	show,
	phone,
	otpCode,
	otpSent,
	otpSending = false,
	otpError,
	verifying,
	countdown,
	onOtpChange,
	onVerify,
	onResend,
	onClose,
}: OTPModalProps) {
	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
			<div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-[460px] w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col items-center gap-4">
					<div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
						<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
					</div>
					<div className="text-center">
						<p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-1.5">
							Phone Verification
						</p>
						<h3 className="text-xl font-bold text-gray-900">Verify your mobile number</h3>
					</div>
				</div>

				{/* Body */}
				<div className="px-8 py-6">
					{/* State 1: Sending in progress */}
					{otpSending && (
						<div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
							<div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
							<p className="text-sm font-medium text-gray-700">
								Sending verification code to <span className="font-semibold">+47 {phone}</span>...
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
										<p className="text-xs text-red-700 mt-1 leading-relaxed">
											{otpError || "Unable to send verification code. Please check your phone number and try again."}
										</p>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-2 pt-2">
								<button
									type="button"
									onClick={onResend}
									className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
								>
									Retry sending code
								</button>
								<button
									type="button"
									onClick={onClose}
									className="w-full py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
								>
									Back to form
								</button>
							</div>
						</div>
					)}

					{/* State 3: Code sent successfully */}
					{!otpSending && otpSent && (
						<div className="space-y-5">
							<p className="text-sm text-gray-600 text-center leading-relaxed">
								Enter the 4-digit verification code sent to{" "}
								<span className="font-semibold text-gray-900">+47 {phone}</span>:
							</p>

							<div className="space-y-3">
								<div className="flex gap-2">
									<input
										type="text"
										inputMode="numeric"
										maxLength={4}
										value={otpCode}
										onChange={(e) => {
											const value = e.target.value.replace(/\D/g, "");
											onOtpChange(value);
											if (value.length === 4) onVerify();
										}}
										className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest text-gray-900 shadow-sm"
										placeholder="0000"
										autoFocus
									/>
									<button
										type="button"
										onClick={onVerify}
										disabled={otpCode.length !== 4 || verifying}
										className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
									>
										{verifying ? "Verifying..." : "Verify"}
									</button>
								</div>

								{otpError && (
									<p className="text-red-600 text-xs text-center font-medium bg-red-50 py-2 px-3 rounded-lg border border-red-100">
										{otpError}
									</p>
								)}
							</div>

							<div className="flex justify-between items-center pt-2 text-sm">
								<button
									type="button"
									onClick={onResend}
									disabled={countdown > 0}
									className={`font-medium transition-colors ${
										countdown > 0
											? "text-gray-400 cursor-not-allowed"
											: "text-blue-600 hover:text-blue-800"
									}`}
								>
									{countdown > 0 ? `Resend code (${countdown}s)` : "Resend code"}
								</button>
								<button
									type="button"
									onClick={onClose}
									className="text-gray-500 hover:text-gray-700 transition-colors"
								>
									Cancel
								</button>
							</div>

							<div className="pt-2">
								<button
									type="button"
									onClick={onClose}
									className="w-full py-2.5 px-4 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
								>
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