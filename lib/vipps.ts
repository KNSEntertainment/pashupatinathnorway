// Vipps ePayment API Service
// This handles integration with Vipps MobilePay ePayment API

interface VippsPaymentRequest {
	amount: {
		currency: string;
		value: number; // Amount in øre (1 NOK = 100 øre)
	};
	paymentMethod: {
		type: "WALLET";
	};
	customer?: {
		phoneNumber?: string;
	};
	reference: string;
	returnUrl: string;
	userFlow: "WEB_REDIRECT";
	paymentDescription: string;
}

interface VippsPaymentResponse {
	orderId: string;
	reference: string;
	userFlow: "WEB_REDIRECT";
	paymentLink?: string;
	redirectUrl: string;
}

interface VippsPaymentDetails {
	orderId: string;
	reference: string;
	status: string;
	amount: {
		currency: string;
		value: number;
	};
	paymentSummary: {
		capturedAmount: {
			currency: string;
			value: number;
		};
		refundedAmount: {
			currency: string;
			value: number;
		};
		remainingAmountToCapture: {
			currency: string;
			value: number;
		};
	};
	customer?: {
		phoneNumber: string;
	};
	paymentMethod: {
		type: string;
	};
	created: string;
}

class VippsService {
	private baseUrl: string;
	private subscriptionKey: string;
	private merchantSerialNumber: string;
	private systemName: string;
	private systemVersion: string;
	private pluginName: string;
	private pluginVersion: string;

	constructor() {
		// Use test environment for development, production for live
		this.baseUrl = process.env.NODE_ENV === "production" ? "https://api.vipps.no" : "https://apitest.vipps.no";

		this.subscriptionKey = process.env.VIPPS_SUBSCRIPTION_KEY || "";
		this.merchantSerialNumber = process.env.VIPPS_MERCHANT_SERIAL_NUMBER || "";
		this.systemName = "PashupatinathNorway";
		this.systemVersion = "1.0.0";
		this.pluginName = "donation-form";
		this.pluginVersion = "1.0.0";

		if (!this.subscriptionKey || !this.merchantSerialNumber) {
			console.warn("Vipps credentials not configured. Using mock mode.");
		}
	}

	private async getAccessToken(): Promise<string> {
		if (!this.subscriptionKey || !this.merchantSerialNumber) {
			throw new Error("Vipps credentials not configured");
		}

		try {
			const clientId = process.env.VIPPS_CLIENT_ID;
			const clientSecret = process.env.VIPPS_CLIENT_SECRET;

			if (!clientId || !clientSecret) {
				throw new Error("Vipps client credentials not configured");
			}

			// Vipps ePayment API authentication - uses simple header-based credentials
			// NOT OAuth2 - credentials are passed as headers, not in Basic Auth
			// See: https://developer.vippsmobilepay.com/docs/APIs/epayment-api/quick-start/

			const response = await fetch(`${this.baseUrl}/accesstoken/get`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					client_id: clientId,
					client_secret: clientSecret,
					"Ocp-Apim-Subscription-Key": this.subscriptionKey,
					"Merchant-Serial-Number": this.merchantSerialNumber,
					"Vipps-System-Name": this.systemName,
					"Vipps-System-Version": this.systemVersion,
					"Vipps-System-Plugin-Name": this.pluginName,
					"Vipps-System-Plugin-Version": this.pluginVersion,
				},
				body: JSON.stringify({}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`Vipps access token error (${response.status} ${response.statusText}):`, errorText);
				throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			if (!data.access_token) {
				throw new Error("No access_token in response");
			}

			console.log("Successfully obtained Vipps access token");
			return data.access_token;
		} catch (error) {
			console.error("Error getting Vipps access token:", error);
			throw error;
		}
	}

	private getHeaders(accessToken: string): Record<string, string> {
		return {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
			"Ocp-Apim-Subscription-Key": this.subscriptionKey,
			"Merchant-Serial-Number": this.merchantSerialNumber,
			"Vipps-System-Name": this.systemName,
			"Vipps-System-Version": this.systemVersion,
			"Vipps-System-Plugin-Name": this.pluginName,
			"Vipps-System-Plugin-Version": this.pluginVersion,
		};
	}

	async createPayment(amountNok: number, reference: string, returnUrl: string, customerPhoneNumber?: string): Promise<VippsPaymentResponse> {
		// Mock implementation if credentials not configured
		if (!this.subscriptionKey || !this.merchantSerialNumber) {
			return this.createMockPayment(amountNok, reference, returnUrl, "Donation");
		}

		try {
			const accessToken = await this.getAccessToken();

			const paymentDescription = "Donation";

			const paymentRequest: VippsPaymentRequest = {
				amount: {
					currency: "NOK",
					value: amountNok * 100, // Convert NOK to øre
				},
				paymentMethod: {
					type: "WALLET",
				},
				reference,
				returnUrl,
				userFlow: "WEB_REDIRECT",
				paymentDescription,
			};

			// Add customer phone number if provided and valid
			if (customerPhoneNumber) {
				// Format phone number properly (add country code if needed)
				const formattedPhoneNumber = VippsService.formatPhoneNumber(customerPhoneNumber);

				// Only add if it matches the required format (9-15 digits)
				if (formattedPhoneNumber && /^\d{9,15}$/.test(formattedPhoneNumber)) {
					paymentRequest.customer = {
						phoneNumber: formattedPhoneNumber,
					};
				} else {
					console.warn(`Invalid phone number format after formatting: ${formattedPhoneNumber}`);
				}
			}

			// Generate idempotency key (unique per request)
			const idempotencyKey = `${reference}-${Date.now()}`;

			const response = await fetch(`${this.baseUrl}/epayment/v1/payments`, {
				method: "POST",
				headers: {
					...this.getHeaders(accessToken),
					"Idempotency-Key": idempotencyKey,
				},
				body: JSON.stringify(paymentRequest),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(`Failed to create Vipps payment: ${response.statusText} - ${JSON.stringify(errorData)}`);
			}

			const data: VippsPaymentResponse = await response.json();
			return data;
		} catch (error) {
			console.error("Error creating Vipps payment:", error);
			throw error;
		}
	}

	async getPaymentDetails(orderId: string): Promise<VippsPaymentDetails> {
		// Mock implementation if credentials not configured
		if (!this.subscriptionKey || !this.merchantSerialNumber) {
			return this.getMockPaymentDetails(orderId);
		}

		try {
			const accessToken = await this.getAccessToken();

			const response = await fetch(`${this.baseUrl}/epayment/v1/payments/${orderId}`, {
				method: "GET",
				headers: this.getHeaders(accessToken),
			});

			if (!response.ok) {
				throw new Error(`Failed to get payment details: ${response.statusText}`);
			}

			const data: VippsPaymentDetails = await response.json();
			return data;
		} catch (error) {
			console.error("Error getting payment details:", error);
			throw error;
		}
	}

	async capturePayment(orderId: number, amountNok?: number): Promise<void> {
		// Mock implementation if credentials not configured
		if (!this.subscriptionKey || !this.merchantSerialNumber) {
			console.log(`Mock: Capturing payment ${orderId} for ${amountNok || "full amount"} NOK`);
			return;
		}

		try {
			const accessToken = await this.getAccessToken();

			const captureRequest = amountNok ? { amount: { currency: "NOK", value: amountNok * 100 } } : {};

			const response = await fetch(`${this.baseUrl}/epayment/v1/payments/${orderId}/capture`, {
				method: "POST",
				headers: this.getHeaders(accessToken),
				body: JSON.stringify(captureRequest),
			});

			if (!response.ok) {
				throw new Error(`Failed to capture payment: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error capturing payment:", error);
			throw error;
		}
	}

	// Mock implementations for development/testing
	private createMockPayment(amountNok: number, reference: string, returnUrl: string, paymentDescription: string): VippsPaymentResponse {
		const orderId = `vipps_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Use paymentDescription to avoid unused variable warning
		console.log(`Mock payment created: ${paymentDescription}`);

		return {
			orderId,
			reference,
			userFlow: "WEB_REDIRECT",
			redirectUrl: `${returnUrl}&orderId=${orderId}&status=COMPLETED`,
			paymentLink: `https://mock.vipps.no/pay/${orderId}`,
		};
	}

	private getMockPaymentDetails(orderId: string): VippsPaymentDetails {
		return {
			orderId,
			reference: `ref_${orderId}`,
			status: "COMPLETED",
			amount: {
				currency: "NOK",
				value: 20000, // 200 NOK in øre
			},
			paymentSummary: {
				capturedAmount: {
					currency: "NOK",
					value: 20000,
				},
				refundedAmount: {
					currency: "NOK",
					value: 0,
				},
				remainingAmountToCapture: {
					currency: "NOK",
					value: 0,
				},
			},
			paymentMethod: {
				type: "WALLET",
			},
			created: new Date().toISOString(),
		};
	}

	// Helper method to generate reference
	static generateReference(prefix: string = "DONATION"): string {
		// Reference must match regex: ^[a-zA-Z0-9-]{8,64}$
		// Only alphanumeric characters and dashes allowed, no underscores
		const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
		const random = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 random alphanumeric chars
		return `${prefix}-${timestamp}-${random}`; // Format: DONATION-12345678-ABCD (total ~25 chars)
	}

	// Helper method to validate phone number
	static validatePhoneNumber(phoneNumber: string): boolean {
		// Norwegian phone numbers should be 8 digits (without country code) or 12 digits (with +47)
		const cleanNumber = phoneNumber.replace(/\D/g, "");
		return cleanNumber.length === 8 || (cleanNumber.length === 11 && cleanNumber.startsWith("47"));
	}

	// Helper method to format phone number for Vipps
	static formatPhoneNumber(phoneNumber: string): string {
		const cleanNumber = phoneNumber.replace(/\D/g, "");
		if (cleanNumber.length === 8) {
			return `47${cleanNumber}`; // Add Norwegian country code
		}
		if (cleanNumber.length === 11 && cleanNumber.startsWith("47")) {
			return cleanNumber;
		}
		return cleanNumber; // Return as-is if format is unexpected
	}
}

export default VippsService;
export type { VippsPaymentRequest, VippsPaymentResponse, VippsPaymentDetails };
