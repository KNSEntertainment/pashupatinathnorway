# Vipps Payment Integration

This document explains how the Vipps payment integration works in the Pashupatinath Norway donation system.

## Overview

The integration uses Vipps MobilePay's **ePayment API** to process donations through the Vipps mobile payment app. The implementation supports:

- Real Vipps API integration with test/production environments
- Mock mode for development without API credentials
- Automatic payment confirmation and capture
- Webhook handling for payment status updates
- Tax ID generation for non-members
- Email receipts for donors

## Architecture

### Components

1. **VippsService** (`/lib/vipps.ts`) - Core service class for Vipps API operations
2. **Payment Creation API** (`/api/vipps/create-payment`) - Creates Vipps payment sessions
3. **Payment Confirmation API** (`/api/vipps/confirm-payment`) - Confirms completed payments
4. **Webhook Handler** (`/api/vipps/webhook`) - Handles Vipps webhook events
5. **Donation Form** (`/components/DonationForm.tsx`) - Updated to use real Vipps flow
6. **Confirmation Page** (`/app/[locale]/donate/confirm/page.tsx`) - Handles payment completion

### Payment Flow

1. User fills donation form and selects Vipps payment
2. Form validation (amount, phone number required for Vipps)
3. Create payment request via `/api/vipps/create-payment`
4. Store donation data in sessionStorage
5. Redirect user to Vipps payment page/redirect URL
6. User completes payment in Vipps app
7. Vipps redirects back to confirmation page
8. Confirmation page calls `/api/vipps/confirm-payment`
9. System captures payment and creates donation record
10. Send confirmation email with tax ID (if applicable)

## Setup Instructions

### 1. Get Vipps API Credentials

1. Register at [Vipps Merchant Portal](https://portal.vipps.no/)
2. Create a new merchant account
3. Set up ePayment API access
4. Get the following credentials:
   - Subscription Key
   - Merchant Serial Number (MSN)
   - Client ID
   - Client Secret

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Test Environment (for development)
VIPPS_SUBSCRIPTION_KEY=your_test_subscription_key
VIPPS_MERCHANT_SERIAL_NUMBER=your_test_msn
VIPPS_CLIENT_ID=your_test_client_id
VIPPS_CLIENT_SECRET=your_test_client_secret

# Application URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### 3. Configure Webhook

In the Vipps Merchant Portal, set up a webhook URL:

```
https://yourdomain.com/api/vipps/webhook
```

Configure webhook events:
- `payment.completed`
- `payment.failed`
- `payment.cancelled`
- `payment.authorized`

## API Endpoints

### POST /api/vipps/create-payment

Creates a new Vipps payment session.

**Request Body:**
```json
{
  "amount": 500,
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "donorPhone": "4712345678",
  "personalNumber": "12345678901",
  "address": "123 Main St",
  "message": "Support the cause",
  "isAnonymous": false,
  "causeId": "cause123",
  "donationType": "cause_specific"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "orderId": "vipps_order_123",
    "reference": "DONATION_1234567890_abcde",
    "redirectUrl": "https://api.vipps.no/...",
    "paymentLink": "https://mock.vipps.no/pay/..."
  },
  "donationData": { ... }
}
```

### POST /api/vipps/confirm-payment

Confirms a completed payment and creates donation record.

**Request Body:**
```json
{
  "orderId": "vipps_order_123",
  "reference": "DONATION_1234567890_abcde",
  "donationData": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "donation": {
    "id": "donation_id",
    "amount": 500,
    "donorName": "John Doe",
    "paymentStatus": "completed",
    "taxId": "TAX123456"
  }
}
```

### POST /api/vipps/webhook

Handles webhook events from Vipps.

**Headers:**
- `x-vipps-signature`: Webhook signature (for verification)

**Request Body:** Varies by event type

## Testing

### Mock Mode

Without API credentials, the system operates in mock mode:
- Returns mock payment URLs
- Simulates successful payments
- Useful for development and testing

### Test Environment

Use Vipps test credentials to test real payments:
- Download Vipps test app
- Use test phone numbers
- No actual money is transferred

### Production

Switch to production credentials:
- Update environment variables
- Ensure webhook URL is publicly accessible
- Test with small amounts first

## Error Handling

### Common Errors

1. **Missing phone number**: Phone number is required for Vipps payments
2. **Invalid phone number**: Must be valid Norwegian number (8 digits or +47 prefix)
3. **Insufficient amount**: Minimum donation is 50 NOK
4. **API credentials**: Missing or invalid Vipps credentials
5. **Payment failed**: User cancelled or payment was rejected

### Error Responses

```json
{
  "error": "Phone number is required for Vipps payment"
}
```

## Security Considerations

1. **Webhook Signature**: Implement signature verification for webhook security
2. **Personal Data**: Encrypt personal numbers using existing encryption system
3. **Session Storage**: Donation data is temporarily stored in sessionStorage
4. **API Keys**: Store credentials securely in environment variables

## Monitoring

Monitor the following:
- Payment success rates
- Webhook delivery failures
- API error rates
- Donation completion times

## Troubleshooting

### Payment Not Working

1. Check environment variables are set correctly
2. Verify Vipps API credentials are valid
3. Ensure webhook URL is accessible
4. Check browser console for JavaScript errors

### Webhook Issues

1. Verify webhook URL is reachable from Vipps
2. Check webhook signature verification
3. Monitor server logs for webhook processing errors

### Email Not Sending

1. Check email configuration in environment variables
2. Verify email service credentials
3. Check spam filters for test emails

## Future Enhancements

1. **Recurring Donations**: Implement subscription payments
2. **Multi-language Support**: Add Norwegian language support
3. **Payment Analytics**: Add payment success rate tracking
4. **Refund Handling**: Implement refund functionality
5. **Advanced Webhook Security**: Implement proper signature verification

## Support

- [Vipps Developer Documentation](https://developer.vippsmobilepay.com/)
- [Vipps Merchant Portal](https://portal.vipps.no/)
- [Vipps API Reference](https://developer.vippsmobilepay.com/api/epayment/)
