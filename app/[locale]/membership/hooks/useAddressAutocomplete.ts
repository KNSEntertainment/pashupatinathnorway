// hooks/useAddressAutocomplete.ts
"use client";
import { useState, useEffect, useRef } from "react";

interface AddressSuggestion {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  postalCode: string;
  kommune: string;
  fylke: string;
}

interface UseAddressAutocompleteProps {
  address: string;
  onApply: (suggestion: AddressSuggestion) => void;
}

export function useAddressAutocomplete({ address, onApply }: UseAddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [locating] = useState(false);
  const lastAppliedAddress = useRef("");

  useEffect(() => {
    // Disabled - no API calls
    setSuggestions([]);
    return;
  }, [address]);

  const applySuggestion = (item: AddressSuggestion) => {
    lastAppliedAddress.current = item.addressLine;
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

  const useCurrentLocation = () => {
    setError("Address lookup is not available.");
    return;
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
