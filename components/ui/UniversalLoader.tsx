"use client";

import Image from "next/image";

interface UniversalLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "pulse" | "dots";
  showLogo?: boolean;
  text?: string;
  className?: string;
}

export default function UniversalLoader({
  size = "md",
  variant = "spinner",
  showLogo = true,
  text,
  className = "",
}: UniversalLoaderProps) {
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      logo: "w-8 h-8",
      spinner: "w-12 h-12",
      dots: "gap-1",
      text: "text-xs",
    },
    md: {
      container: "w-20 h-20",
      logo: "w-10 h-10",
      spinner: "w-16 h-16",
      dots: "gap-2",
      text: "text-sm",
    },
    lg: {
      container: "w-24 h-24",
      logo: "w-12 h-12",
      spinner: "w-20 h-20",
      dots: "gap-2",
      text: "text-base",
    },
    xl: {
      container: "w-32 h-32",
      logo: "w-16 h-16",
      spinner: "w-28 h-28",
      dots: "gap-3",
      text: "text-lg",
    },
  };

  const config = sizeConfig[size];

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className="relative">
            {/* Outer rotating ring */}
            <div className={`absolute inset-0 ${config.spinner} rounded-full border-2 border-transparent border-t-brand_primary animate-spin`}></div>
            {/* Inner rotating ring - reverse */}
            <div className={`absolute inset-2 ${config.spinner} rounded-full border-2 border-transparent border-b-brand_secondary animate-spin-reverse`}></div>
            {/* Logo in center */}
            {showLogo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`${config.logo} relative`}>
                  <div className={`absolute inset-0 bg-brand_primary/20 rounded-full animate-pulse`}></div>
                  <Image
                    src="/pashupatinath.png"
                    alt="Loading..."
                    width={parseInt(config.logo.split(" ")[0].replace("w-", ""))}
                    height={parseInt(config.logo.split(" ")[1].replace("h-", ""))}
                    className="relative z-10"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "pulse":
        return (
          <div className={`${config.container} relative flex items-center justify-center`}>
            {showLogo && (
              <>
                <div className={`absolute inset-0 ${config.logo} bg-gradient-to-br from-brand_primary/20 to-brand_secondary/20 rounded-full animate-pulse`}></div>
                <Image
                  src="/pashupatinath.png"
                  alt="Loading..."
                  width={parseInt(config.logo.split(" ")[0].replace("w-", ""))}
                  height={parseInt(config.logo.split(" ")[1].replace("h-", ""))}
                  className="relative z-10 animate-pulse"
                />
              </>
            )}
            {!showLogo && (
              <div className={`${config.container} bg-gradient-to-br from-brand_primary to-brand_secondary rounded-full animate-pulse`}></div>
            )}
          </div>
        );

      case "dots":
        return (
          <div className="flex flex-col items-center gap-4">
            {showLogo && (
              <div className={`${config.logo} relative`}>
                <div className={`absolute inset-0 bg-brand_primary/20 rounded-full animate-pulse`}></div>
                <Image
                  src="/pashupatinath.png"
                  alt="Loading..."
                  width={parseInt(config.logo.split(" ")[0].replace("w-", ""))}
                  height={parseInt(config.logo.split(" ")[1].replace("h-", ""))}
                  className="relative z-10"
                />
              </div>
            )}
            <div className={`flex ${config.dots}`}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-brand_primary rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "1s",
                  }}
                ></div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`${config.text} text-gray-600 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
}
