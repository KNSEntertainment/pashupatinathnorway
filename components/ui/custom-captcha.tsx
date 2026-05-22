"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface CustomCaptchaProps {
  onVerify: (isValid: boolean) => void;
  onCaptchaChange?: (captchaData: { text: string; hash: string }) => void;
  className?: string;
  error?: string;
}

export default function CustomCaptcha({ onVerify, onCaptchaChange, className = "", error }: CustomCaptchaProps) {
  const [captchaText, setCaptchaText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  // Generate a simple math captcha
  const generateCaptcha = async () => {
    setLoading(true);
    setUserInput("");
    setCaptchaToken("");
    setVerified(false);
    onVerify(false);
    
    try {
      const response = await fetch("/api/captcha", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to generate captcha");
      const data = await response.json();
      setCaptchaText(`${data.question} = ?`);
      setCaptchaToken(data.token);
      onCaptchaChange?.({ text: "", hash: data.token });
    } catch (error) {
      console.error("Error generating captcha:", error);
      setCaptchaText("Refresh to try again");
    } finally {
      setLoading(false);
    }
  };

  const verifyCaptcha = (input: string) => {
    if (!input || !captchaText || !captchaToken) return;
    
    try {
      setVerified(true);
      onVerify(true);
      onCaptchaChange?.({ text: input, hash: captchaToken });
    } catch (error) {
      console.error("Error verifying captcha:", error);
      setVerified(false);
      onVerify(false);
    }
  };

  const handleInputChange = (value: string) => {
    setUserInput(value);
    if (value.trim()) {
      verifyCaptcha(value);
    } else {
      setVerified(false);
      onVerify(false);
    }
  };

  useEffect(() => {
    generateCaptcha();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-gray-300 shadow-sm min-w-[200px]">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              {captchaText || "Loading..."}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Solve the math problem above
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={generateCaptcha}
          disabled={loading}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh captcha"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div>
        <input
          type="text"
          value={userInput}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter your answer"
          className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : verified
              ? "border-green-300 focus:ring-green-500 focus:border-green-500"
              : "border-gray-300"
          }`}
        />
        
        {error && (
          <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {verified && !error && (
          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Captcha verified successfully
          </p>
        )}
      </div>
    </div>
  );
}
