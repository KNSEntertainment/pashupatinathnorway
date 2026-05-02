"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, X } from "lucide-react";

interface AddressSuggestion {
  formatted: string;
  city: string;
  postcode: string;
  country: string;
  state?: string;
  county?: string;
  lat: number;
  lon: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Enter address (street, postal code, city)", 
  label = "Address",
  className = ""
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [, setSelectedSuggestion] = useState<AddressSuggestion | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3 || !GEOAPIFY_API_KEY) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&countrycode=no`
      );
      
      if (!response.ok) throw new Error("Failed to fetch address suggestions");
      
      const data = await response.json();
      
      const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: { geometry: { coordinates: [number, number] }; properties: Record<string, unknown> }) => {
        const properties = feature.properties;
        return {
          formatted: properties.formatted || properties.address_line1 || properties.name,
          city: properties.city || properties.municipality || "",
          postcode: properties.postcode || "",
          country: properties.country || "",
          state: properties.state || "",
          county: properties.county || "",
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0]
        };
      });

      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Address search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchAddress(inputValue);
    }, 300);
    
    setShowSuggestions(true);
    setSelectedSuggestion(null);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    // Use the formatted address which already contains complete address information
    onChange(suggestion.formatted);
    setSelectedSuggestion(suggestion);
    setShowSuggestions(false);
  };

  const clearAddress = () => {
    onChange("");
    setSelectedSuggestion(null);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <Label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </Label>
      )}
      
      <div className="relative">
        <Input
          id="address"
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pr-10"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : value ? (
            <button
              type="button"
              onClick={clearAddress}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          ) : (
            <MapPin className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {suggestion.formatted}
                  </div>
                  <div className="text-sm text-gray-500">
                    {suggestion.postcode && <span>{suggestion.postcode}</span>}
                    {suggestion.postcode && suggestion.city && <span>, </span>}
                    {suggestion.city && <span>{suggestion.city}</span>}
                    {suggestion.county && suggestion.county !== suggestion.city && (
                      <span>, {suggestion.county}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No suggestions found */}
      {showSuggestions && !isLoading && value.length >= 3 && suggestions.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
          <div className="text-sm text-gray-500 text-center">
            No addresses found. Try entering a street name, postal code, or city.
          </div>
        </div>
      )}
    </div>
  );
}
