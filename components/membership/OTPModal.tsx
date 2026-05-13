// components/membership/OTPModal.tsx
"use client";

interface OTPModalProps {
	show: boolean;
	phone: string;
	otpCode: string;
	otpSent: boolean;
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
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-[460px] w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col items-center gap-4">
					<div className="w-13 h-13 rounded-full bg-blue-50 flex items-center justify-center">
						<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
					</div>
					<div className="text-center">
						<p className="text-xs font-medium tracking-widest uppercase text-blue-600 mb-1.5">
							Phone Verification
						</p>
						<h3 className="text-xl font-medium text-gray-900">Verify your phone number</h3>
					</div>
				</div>

				{/* Body */}
				<div className="px-8 py-6">
					<p className="text-sm text-gray-500 text-center leading-relaxed mb-5">
						{otpSent
							? `Enter the 4-digit verification code sent to +47 ${phone}:`
							: "Sending verification code..."}
					</p>

					{otpSent && (
						<div className="space-y-4">
							<div className="flex gap-2">
								<input
									type="text"
									maxLength={4}
									value={otpCode}
									onChange={(e) => {
										const value = e.target.value.replace(/\D/g, "");
										onOtpChange(value);
										if (value.length === 4) onVerify();
									}}
									className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
									placeholder="0000"
									autoFocus
								/>
								<button
									type="button"
									onClick={onVerify}
									disabled={otpCode.length !== 4 || verifying}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									{verifying ? "Verifying..." : "Verify"}
								</button>
							</div>

							{otpError && <p className="text-red-600 text-sm mt-2">{otpError}</p>}

							<div className="mt-4 flex justify-between items-center">
								<button
									type="button"
									onClick={onResend}
									disabled={countdown > 0}
									className={`text-sm transition-colors ${
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
									className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
								>
									Cancel
								</button>
							</div>
						</div>
					)}

					<div className="flex flex-col gap-2 mt-6">
						<button
							onClick={onClose}
							className="w-full py-2.5 px-4 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Back to form
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}