// hooks/useAddressAutocomplete.ts
"use client";
import { useState, useEffect, useRef } from "react";
import { AddressSuggestion, GeoapifyFeature, GeoapifyResponse } from "@/components/membership/types/membership";
import { FYLKE_MAPPING } from "@/components/membership/types/membership";

interface UseAddressAutocompleteProps {
	address: string;
	onApply: (suggestion: AddressSuggestion) => void;
}

export function useAddressAutocomplete({ address, onApply }: UseAddressAutocompleteProps) {
	const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
	const [locating, setLocating] = useState(false);
	const lastAppliedAddress = useRef("");
	const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

	useEffect(() => {
		if (!geoapifyKey || !address || address.trim().length < 3) {
			setSuggestions([]);
			return;
		}
		if (address === lastAppliedAddress.current) return;

		const controller = new AbortController();
		const timer = setTimeout(async () => {
			try {
				setLoading(true);
				const text = encodeURIComponent(address.trim());
				const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&filter=countrycode:no&type=street&limit=5&apiKey=${geoapifyKey}`;
				const res = await fetch(url, { signal: controller.signal });
				if (!res.ok) throw new Error("Failed to fetch address suggestions");

				const data = (await res.json()) as GeoapifyResponse;
				const mapped: AddressSuggestion[] = (data.features || []).map((feature: GeoapifyFeature) => {
					const props = feature.properties || {};
					const addressLine = [props.street, props.housenumber].filter(Boolean).join(" ").trim() || props.formatted || "";
					const city = props.city || props.town || props.village || props.municipality || props.county || "";
					const postalCode = props.postcode || "";
					const kommune = props.suburb || "";
					const fylkeCode = props.iso3166_2 || "";
					const fylke = FYLKE_MAPPING[fylkeCode] || "";

					return {
						id: props.place_id?.toString() || feature?.id?.toString() || `${addressLine}-${postalCode}`,
						label: props.formatted || addressLine || "Unknown address",
						addressLine: addressLine || props.formatted || "",
						city,
						postalCode,
						kommune,
						fylke,
					};
				});

				setSuggestions(mapped);
				setActiveSuggestionIndex(mapped.length > 0 ? 0 : -1);
			} catch (err: unknown) {
				if (!(err instanceof Error) || err.name !== "AbortError") {
					setError("Could not load address suggestions.");
				}
			} finally {
				setLoading(false);
			}
		}, 350);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [address, geoapifyKey]);

	const applySuggestion = (item: AddressSuggestion) => {
		lastAppliedAddress.current = item.addressLine || item.label;
		setSuggestions([]);
		setActiveSuggestionIndex(-1);
		onApply(item);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (suggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
		} else if (e.key === "Enter" && activeSuggestionIndex >= 0) {
			e.preventDefault();
			applySuggestion(suggestions[activeSuggestionIndex]);
		} else if (e.key === "Escape") {
			setSuggestions([]);
			setActiveSuggestionIndex(-1);
		}
	};

	const useCurrentLocation = (
		onSuccess: (data: { address: string; city: string; postalCode: string }) => void
	) => {
		if (!geoapifyKey) { setError("Address lookup is not available."); return; }
		if (!navigator.geolocation) { setError("Geolocation is not supported in this browser."); return; }

		setLocating(true);
		setError("");

		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				try {
					const { latitude, longitude } = pos.coords;
					const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&type=street&format=geojson&apiKey=${geoapifyKey}`;
					const res = await fetch(url);
					if (!res.ok) throw new Error("Failed to reverse geocode");

					const data = await res.json();
					const props = data?.features?.[0]?.properties || {};
					const addressLine = [props.street, props.housenumber].filter(Boolean).join(" ").trim() || props.formatted || "";
					const city = props.city || props.town || props.village || props.municipality || props.county || "";
					const postalCode = props.postcode || "";

					onSuccess({ address: addressLine, city, postalCode });
					setSuggestions([]);
				} catch {
					setError("Could not fetch your address.");
				} finally {
					setLocating(false);
				}
			},
			() => {
				setError("Unable to access your location.");
				setLocating(false);
			},
			{ enableHighAccuracy: true, timeout: 8000 }
		);
	};

	const clearError = () => setError("");

	return {
		suggestions,
		loading,
		error,
		activeSuggestionIndex,
		locating,
		applySuggestion,
		handleKeyDown,
		useCurrentLocation,
		clearError,
	};
}