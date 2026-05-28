# Vipps Integration – RSP Norway Donation Form

## Files to drop into your project

| File                                        | Where it goes                               |
| ------------------------------------------- | ------------------------------------------- |
| `src/lib/vipps.ts`                          | `src/lib/vipps.ts`                          |
| `src/app/api/vipps/create-payment/route.ts` | `src/app/api/vipps/create-payment/route.ts` |
| `src/app/api/vipps/payment-status/route.ts` | `src/app/api/vipps/payment-status/route.ts` |
| `src/app/payment-success/page.tsx`          | `src/app/payment-success/page.tsx`          |
| `src/app/DonationForm.tsx`                  | Replace your existing DonationForm          |
| `.env.local.example`                        | Copy to `.env.local` and fill in values     |

## What changed in DonationForm

Only **two things** changed from your original:

1. **Redirect is now enabled** — `window.location.href = result.payment.redirectUrl` is uncommented and active.
2. **`showVippsSuccess` state removed** — success is now handled by the `/payment-success` page that Vipps redirects back to. No modal needed.

Everything else (field names, state, fetch body, response shape, styling) is identical.

## Setup

### 1. Add env vars

```bash
cp .env.local.example .env.local
# Fill in your VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET, VIPPS_SUBSCRIPTION_KEY, VIPPS_MSN
```

### 2. Expose localhost with ngrok

Vipps redirects back to `NEXT_PUBLIC_BASE_URL/payment-success?reference=...` This **must** be a public HTTPS URL — `localhost` doesn't work.

```bash
ngrok http 3000
# Copy the https://xxxx.ngrok.io URL → paste into .env.local as NEXT_PUBLIC_BASE_URL
```

### 3. Set up a test user

1. Go to https://portal.vippsmobilepay.com → For Developers → Test Users → Add
2. Note the **phone number** and **NIN**
3. Install the Vipps MT test app: https://testflight.apple.com/join/hTAYrwea (iOS)
4. Log in with test user credentials. PIN = `1236`

### 4. Run and test

```bash
npm run dev
```

Fill the form with your **test user's phone number**, choose an amount, submit. Vipps landing page opens → confirm in the MT app → redirected to `/payment-success`.

## Payment flow

```
DonationForm.handleSubmit()
  └─ POST /api/vipps/create-payment
       ├─ getAccessToken()          → POST /accesstoken/get
       ├─ createVippsPayment()      → POST /epayment/v1/payments
       └─ returns { payment: { orderId, reference, redirectUrl }, donationData }

DonationForm
  ├─ sessionStorage.setItem(`donation_${reference}`, donationData)
  └─ window.location.href = redirectUrl   ← user goes to Vipps landing page

[User approves in Vipps MT app]

Vipps redirects → /payment-success?reference=don-xxx
  └─ polls GET /api/vipps/payment-status?reference=don-xxx  (every 2.5s, max 10x)
       ├─ getVippsPaymentStatus()   → GET /epayment/v1/payments/{reference}
       ├─ captureVippsPayment()     → POST /epayment/v1/payments/{reference}/capture
       └─ returns { state: "AUTHORIZED", amount: { value: <øre> } }

/payment-success shows ✅ success screen
```

## Captcha note

The API route tries to verify the captcha against `/api/captcha/verify`. If that endpoint doesn't exist yet, the warning is logged and the submission continues (relying on the frontend `captchaValid` guard). Add server-side captcha verification before going to production.

## Test amounts that trigger errors

| Amount (NOK) | Error              |
| ------------ | ------------------ |
| 1.51         | Insufficient funds |
| 1.82         | Refused by issuer  |
| 1.83         | Suspected fraud    |
| 1.86         | Expired card       |
| 1.87         | Invalid card       |

## Going to production

1. Set `VIPPS_BASE_URL=https://api.vipps.no`
2. Swap in production API keys
3. Set `NEXT_PUBLIC_BASE_URL` to your real domain
4. Save payment references + donationData in your database (not just sessionStorage)
5. Consider deferred capture (remove auto-capture from status route, capture on fulfilment)
6. Add Vipps webhooks for reliable server-side notifications
