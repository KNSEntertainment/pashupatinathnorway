// components/membership/SuccessModal.tsx
"use client";

interface SuccessModalProps {
	show: boolean;
	message: string;
	submitAnotherLabel: string;
	onSubmitAnother: () => void;
	onGoHome: () => void;
}

export function SuccessModal({
	show,
	message,
	submitAnotherLabel,
	onSubmitAnother,
	onGoHome,
}: SuccessModalProps) {
	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
			<div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-[460px] w-full max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="px-8 pt-8 pb-6 border-b border-gray-100 flex flex-col items-center gap-4">
					<div className="w-13 h-13 rounded-full bg-green-50 flex items-center justify-center">
						<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<div className="text-center">
						<p className="text-xs font-medium tracking-widest uppercase text-green-600 mb-1.5">
							Registration complete
						</p>
						<h3 className="text-xl font-medium text-gray-900">You&apos;re all set</h3>
					</div>
				</div>

				{/* Body */}
				<div className="px-8 py-6">
					<p className="text-sm text-gray-500 text-center leading-relaxed mb-5">{message}</p>

					<div className="flex flex-col gap-2">
						<button
							onClick={onSubmitAnother}
							className="w-full py-2.5 px-4 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
						>
							{submitAnotherLabel}
						</button>
						<button
							onClick={onGoHome}
							className="w-full py-2.5 px-4 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Go to homepage
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}