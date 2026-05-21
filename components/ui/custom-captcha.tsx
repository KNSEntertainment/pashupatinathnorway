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
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  // Generate a simple math captcha
  const generateCaptcha = () => {
    setLoading(true);
    setUserInput("");
    setVerified(false);
    onVerify(false);
    
    try {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const operations = ['+', '-', '*'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      
      let answer = 0;
      let question = '';
      
      switch (operation) {
        case '+':
          answer = num1 + num2;
          question = `${num1} + ${num2}`;
          break;
        case '-':
          // Ensure positive result
          if (num1 < num2) {
            answer = num2 - num1;
            question = `${num2} - ${num1}`;
          } else {
            answer = num1 - num2;
            question = `${num1} - ${num2}`;
          }
          break;
        case '*':
          // Keep multiplication simple
          const smallNum1 = Math.floor(Math.random() * 5) + 1;
          const smallNum2 = Math.floor(Math.random() * 5) + 1;
          answer = smallNum1 * smallNum2;
          question = `${smallNum1} × ${smallNum2}`;
          break;
      }
      
      setCaptchaText(`${question} = ?`);
      const hash = btoa(`${question}:${answer}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
      
      if (onCaptchaChange) {
        onCaptchaChange({ text: "", hash: hash });
      }
      
      // Store the answer in session storage for verification
      sessionStorage.setItem('captcha_answer', answer.toString());
      sessionStorage.setItem('captcha_hash', hash);
      
    } catch (error) {
      console.error("Error generating captcha:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCaptcha = (input: string) => {
    if (!input || !captchaText) return;
    
    try {
      const storedAnswer = sessionStorage.getItem('captcha_answer');
      const storedHash = sessionStorage.getItem('captcha_hash');
      
      if (storedAnswer && input.trim() === storedAnswer.trim()) {
        setVerified(true);
        onVerify(true);
        
        if (onCaptchaChange && storedHash) {
          onCaptchaChange({ text: input, hash: storedHash });
        }
      } else {
        setVerified(false);
        onVerify(false);
      }
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
