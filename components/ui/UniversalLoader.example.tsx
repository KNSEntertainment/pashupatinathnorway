// UniversalLoader Usage Examples
// Copy and paste these examples where you need loading states

import UniversalLoader from "@/components/ui/UniversalLoader";

// Example usage in a component:
export default function ExampleUsage() {
  return (
    <div>
      {/* Basic usage with logo */}
      <UniversalLoader />

      {/* Small size for buttons/inline loading */}
      <UniversalLoader size="sm" />

      {/* Large size for full-screen loading */}
      <UniversalLoader size="xl" variant="spinner" text="Loading content..." />

      {/* Pulse variant with custom text */}
      <UniversalLoader variant="pulse" text="Processing your request..." />

      {/* Dots variant without logo */}
      <UniversalLoader variant="dots" showLogo={false} text="Please wait..." />

      {/* Custom styling */}
      <UniversalLoader 
        size="lg" 
        variant="spinner" 
        text="Uploading files..." 
        className="min-h-screen bg-gray-50"
      />
    </div>
  );
}
