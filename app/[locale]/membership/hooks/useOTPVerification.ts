// hooks/useOTPVerification.ts
"use client";
import { useState, useEffect } from "react";

interface UseOTPVerificationProps {
	phone: string;
	onVerified: () => void;
}

export function useOTPVerification({ phone, onVerified }: UseOTPVerificationProps) {
	const [showOTPModal, setShowOTPModal] = useState(false);
	const [otpCode, setOtpCode] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [phoneVerified, setPhoneVerified] = useState(false);
	const [otpError, setOtpError] = useState("");
	const [otpSending, setOtpSending] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [verifying, setVerifying] = useState(false);

	// Countdown timer
	useEffect(() => {
		if (countdown <= 0) return;
		const interval = setInterval(() => setCountdown((prev) => prev - 1), 1000);
		return () => clearInterval(interval);
	}, [countdown]);

	// Start countdown when OTP sent
	useEffect(() => {
		if (otpSent) setCountdown(120);
	}, [otpSent]);

	// Clear error when modal closes or phone is verified
	useEffect(() => {
		if (!showOTPModal || phoneVerified) setOtpError("");
	}, [showOTPModal, phoneVerified]);

	const sendOTPCode = async () => {
		setOtpSending(true);
		setOtpError("");

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

			const response = await fetch("/api/send-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phoneNumber: phone }),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Failed to send OTP");
			}

			setOtpSent(true);
			setOtpError("");
		} catch (error) {
			setOtpSent(false);
			if (error instanceof Error && error.name === "AbortError") {
				setOtpError("Request timed out. Please try again.");
			} else {
				setOtpError(error instanceof Error ? error.message : "Failed to send verification code");
			}
		} finally {
			setOtpSending(false);
		}
	};

	const handleOtpChange = (value: string) => {
		setOtpCode(value);
		setOtpError("");
	};

	const verifyOTPCode = async (codeToVerify?: string) => {
		const code = (typeof codeToVerify === "string" ? codeToVerify : otpCode).trim();
		if (verifying || phoneVerified) return;
		if (!code || code.length !== 4) {
			setOtpError("Please enter the 4-digit verification code");
			return;
		}

		setVerifying(true);
		setOtpError("");

		try {
			const response = await fetch("/api/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phoneNumber: phone, code }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Invalid verification code. Please try again.");
			}

			setOtpError("");
			setPhoneVerified(true);
			setShowOTPModal(false);
			setOtpCode("");
			onVerified();
		} catch (error) {
			setOtpError(error instanceof Error ? error.message : "Failed to verify code");
		} finally {
			setVerifying(false);
		}
	};

	const resendOTP = async () => {
		setOtpSent(false);
		setOtpCode("");
		setOtpError("");
		setCountdown(0);
		await sendOTPCode();
	};

	const openModal = async () => {
		setShowOTPModal(true);
		await sendOTPCode();
	};

	const closeModal = () => {
		setShowOTPModal(false);
		setOtpCode("");
		setOtpError("");
		setCountdown(0);
	};

	const reset = () => {
		setShowOTPModal(false);
		setOtpCode("");
		setOtpSent(false);
		setPhoneVerified(false);
		setOtpError("");
		setOtpSending(false);
		setCountdown(0);
		setVerifying(false);
	};

	return {
		showOTPModal,
		otpCode,
		setOtpCode: handleOtpChange,
		otpSent,
		phoneVerified,
		otpError,
		otpSending,
		countdown,
		verifying,
		openModal,
		closeModal,
		verifyOTPCode,
		resendOTP,
		reset,
	};
}
