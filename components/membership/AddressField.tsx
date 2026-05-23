// components/membership/AddressField.tsx
"use client";
import { useRef } from "react";
import { LocateIcon } from "lucide-react";
import { AddressSuggestion } from "@/components/membership/types/membership";
import { FormField, StyledInput } from "./FormField";

interface AddressFieldProps {
	// Street address
	address: string;
	addressError?: string;
	onAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onAddressKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	suggestions: AddressSuggestion[];
	activeSuggestionIndex: number;
	onSelectSuggestion: (item: AddressSuggestion) => void;
	addressLoading: boolean;
	locating: boolean;
	onUseLocation: (callback: (data: { address: string; city: string; postalCode: string }) => void) => void;
	onLocationResult: (data: { address: string; city: string; postalCode: string }) => void;
	locatingLabel: string;
	useCurrentLocationLabel: string;

	// City / postal
	city: string;
	cityError?: string;
	postalCode: string;
	postalCodeError?: string;
	bydel: string;
	kommune: string;
	fylke: string;
	onFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;

	// Labels
	streetAddressLabel: string;
	streetAddressPlaceholder: string;
	cityLabel: string;
	cityPlaceholder: string;
	postalCodeLabel: string;
	postalCodePlaceholder: string;
}

export function AddressField({
	address, addressError, onAddressChange, onAddressKeyDown,
	suggestions, activeSuggestionIndex, onSelectSuggestion,
	addressLoading, locating, onUseLocation, onLocationResult,
	locatingLabel, useCurrentLocationLabel,
	city, cityError, postalCode, postalCodeError,
	bydel, kommune, fylke, onFieldChange,
	streetAddressLabel, streetAddressPlaceholder,
	cityLabel, cityPlaceholder,
	postalCodeLabel, postalCodePlaceholder,
}: AddressFieldProps) {
	const fylkeInputRef = useRef<HTMLInputElement>(null);

	const handleSelectSuggestion = (item: AddressSuggestion) => {
		onSelectSuggestion(item);
		setTimeout(() => fylkeInputRef.current?.focus(), 100);
	};

	return (
		<div className="grid md:grid-cols-2 gap-6">
			{/* Street Address — full width */}
			<div className="md:col-span-2">
				<FormField label={streetAddressLabel} required error={addressError}>
					<div className="relative">
						<StyledInput
							type="text"
							name="address"
							value={address}
							onChange={onAddressChange}
							onKeyDown={onAddressKeyDown}
							hasError={!!addressError}
							placeholder={streetAddressPlaceholder}
							autoComplete="off"
						/>
						<div className="mt-2">
							<button
								type="button"
								onClick={() => onUseLocation(onLocationResult)}
								disabled={locating}
								className={`text-sm font-medium px-3 py-1.5 rounded border border-light hover:bg-light transition-colors ${locating ? "opacity-60 cursor-not-allowed" : ""}`}
							>
								{locating ? (
									locatingLabel
								) : (
									<div className="flex items-center">
										<LocateIcon className="w-4 h-4 mr-1 text-blue-600" />
										{useCurrentLocationLabel}
									</div>
								)}
							</button>
						</div>
						{addressLoading && (
							<div className="absolute right-3 top-2.5 text-xs text-gray-500">Loading…</div>
						)}

						{/* Suggestions dropdown */}
						{suggestions.length > 0 && (
							<ul className="absolute z-20 mt-1 w-full bg-white border border-light rounded-lg shadow-lg max-h-60 overflow-auto">
								{suggestions.map((item, index) => (
									<li
										key={item.id}
										className={`px-3 py-2 text-sm text-gray-900 cursor-pointer ${
											index === activeSuggestionIndex ? "bg-light" : "hover:bg-light"
										}`}
										onMouseDown={(e) => {
											e.preventDefault();
											handleSelectSuggestion(item);
										}}
									>
										<div className="font-medium">{item.label}</div>
										<div className="text-xs text-gray-600">
											{[item.postalCode, item.city].filter(Boolean).join(" ")}
										</div>
										{(item.kommune || item.fylke) && (
											<div className="text-xs text-gray-500">
												{[
													item.kommune && `Kommune: ${item.kommune}`,
													item.fylke && `Fylke: ${item.fylke}`,
												]
													.filter(Boolean)
													.join(" • ")}
											</div>
										)}
									</li>
								))}
							</ul>
						)}
					</div>
				</FormField>
			</div>

			{/* Postal Code */}
			<FormField label={postalCodeLabel} required error={postalCodeError}>
				<StyledInput
					type="text"
					name="postalCode"
					value={postalCode}
					onChange={onFieldChange}
					hasError={!!postalCodeError}
					placeholder={postalCodePlaceholder}
				/>
			</FormField>

			{/* City */}
			<FormField label={cityLabel} required error={cityError}>
				<StyledInput
					type="text"
					name="city"
					value={city}
					onChange={onFieldChange}
					hasError={!!cityError}
					placeholder={cityPlaceholder}
				/>
			</FormField>

			{/* Bydel */}
			<FormField label="Bydel (Borough/District)">
				<div className="relative">
					<StyledInput
						type="text"
						name="bydel"
						value={bydel}
						onChange={onFieldChange}
						className="bg-gray-50 text-gray-700"
						placeholder="e.g., Sentrum"
					/>
					<div className="absolute right-3 top-2.5 text-gray-400">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
					</div>
				</div>
			</FormField>

			{/* Kommune */}
			<FormField label="Kommune (District)">
				<div className="relative">
					<StyledInput
						type="text"
						name="kommune"
						value={kommune}
						onChange={onFieldChange}
						className="bg-gray-50 text-gray-700"
						placeholder="e.g., Ammerud"
					/>
					<div className="absolute right-3 top-2.5 text-gray-400">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
				</div>
			</FormField>

			{/* Fylke */}
			<FormField label="Fylke (County)">
				<div className="relative">
					<input
						type="text"
						name="fylke"
						ref={fylkeInputRef}
						value={fylke}
						onChange={onFieldChange}
						className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
					/>
					<div className="absolute right-3 top-2.5 text-gray-400">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</FormField>
		</div>
	);
}